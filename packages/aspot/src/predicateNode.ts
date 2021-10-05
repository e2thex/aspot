

import { and, has } from "./match";
import { emptyContext, StoreNode, TermType, watcher, Match, StoreGet, StoreSet, WatcherGen, Sentence } from "./basicStoreNode";
import { v4 } from "uuid";

export type OnSet = () => void;

type IsGenProps = {
  onSet:OnSet,
  subject: string,
  predicate :string,
  get: StoreGet,
  set: StoreSet,
}
type Is = ((object?:string | null) => void |string | null);
type IsGen = (props:IsGenProps) => Is
const isGen:IsGen = (props) => (object) => {
  const { onSet, subject, predicate, get, set  } = props;
  if (typeof object === 'undefined' ) {
    const s = get( and(has(TermType.subject)(subject), has(TermType.predicate)(predicate))(emptyContext()))[0];
    return s ? s.object : null;
  }
  console.log({...props, object})
  onSet();
  return set({subject, predicate, object, date:Date.now()})[0]
}

export type PredicateNodeDeps = {
  is: IsGen,
  watcher: WatcherGen,
  uuid: () => string, 
}
type PredicateNodeProps<A extends StoreNode> = {
  onSet:OnSet,
  subject: string,
  predicate :string,
  node:A,
}
export type SMethod<A extends StoreNode> = (predicate:string) => PredicateNode<A>; 
export type PredicateNode<A extends StoreNode> = {
  is: Is, 
  s: SMethod<A>,
  del: (depth?:number) => void,
  on: (action:(...s:Sentence[]) => void) => void,
  predicate: () => string,
}
const predicateNodeCore = (deps:PredicateNodeDeps) => <A extends StoreNode> (props:PredicateNodeProps<A>): PredicateNode<A> => {
  const {node, subject, predicate, onSet } = props;
  const { is, watcher, uuid } = deps;
  const match = and(has(TermType.subject)(subject), has(TermType.predicate)(predicate));
  const fallbackObject = uuid();
  const internalS = (predicateInternal) => {
    const object = is({...node, subject, predicate:predicate, onSet})();
    const newOnSet = () => {
      object ? onSet() : is({...node, onSet,subject, predicate})(fallbackObject);
    }
    return predicateNodeCore(deps)({node, subject:object|| fallbackObject, predicate:predicateInternal, onSet:newOnSet})
  }
  const del = ({subject, predicate}:{subject:string, predicate:string}) => (depth:number=0) => {
    const object = is({...node, subject, predicate, onSet:() => {}})();
    is({...node, subject, predicate, onSet:() => {}})(null);
    if (depth && object) {
      node.get(s => s.subject === object).forEach(s => del({...s})(depth-1))
    }
  }
  return {
    ...node,
    del: del({subject, predicate}),
    is: is({...node, subject, predicate, onSet}),
    on: (action) => node.watch(watcher(action)(match(emptyContext()))),
    s: internalS,
    predicate: () => predicate,
  }
}
const predicateNode = predicateNodeCore({is:isGen, watcher, uuid:v4});
export type PredicateNodeGen<A extends StoreNode> = (p:PredicateNodeProps<A>) => PredicateNode<A>;
export default predicateNode;
export {
  predicateNodeCore,
}
