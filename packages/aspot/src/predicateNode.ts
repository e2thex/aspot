

import { and, has } from "./match";
import { emptyContext, StoreNode, TermType, watcher, Match, StoreGet, StoreSet, WatcherGen, Sentence, UpdateResponse } from "./basicStoreNode";
import { v4 } from "uuid";
import { subjectNodeCore } from "./subjectNode";
import { isConstructorDeclaration } from "typescript";

export type OnSet = () => void;

export type IsGenProps = {
  onSet:OnSet,
  subject: string,
  predicate :string,
  set: StoreSet,
}
export type Is = (object:string | null) => UpdateResponse;
export type IsGen = (props:IsGenProps) => Is
const isGen:IsGen = (props) => (object) => {
  const { onSet, subject, predicate, set  } = props;
  onSet();
  return set({subject, predicate, object, date:Date.now()})[0]
}
export type Depth = 1|2|3|4|5|6
export type ValueDepth = {
  [k:string]: ValueDepth | string
}
export type Value = string | null;
export type ValueGenProps = {
  subject: string,
  predicate :string,
  get: StoreGet,
}
export type Val = <D extends number>(depth?:D) => D extends 1| 2| 3| 4| 5| 6| 7| 8 |9 |10 |11 |12| 13| 14  ? ValueDepth: Value;
export type ValueGen = (props:ValueGenProps) => Val
const valueGen =(props:ValueGenProps) => {
  const { subject, predicate, get } = props;
  const val:Val  = (depth?) => {
    const sentence = get(and(has(TermType.subject)(subject), has(TermType.predicate)(predicate))(emptyContext()))[0];
    const target = sentence ? sentence.object: null;
    if((depth === 0) || (typeof depth === 'undefined')) return target as any
    const sentences = get(s => s.subject === target) 
    return sentences.reduce((result, s) => ({
      ...result,
      [s.predicate]:  valueGen({...props, subject:s.subject, predicate:s.predicate})(depth > 1 ? depth - 1 : undefined)
    })
    ,{} as any)
  }
  return val;
}

export type PredicateNodeDeps = {
  is: IsGen,
  value: ValueGen,
  watcher: WatcherGen,
  uuid: () => string, 
}
export type PredicateNodeProps<A extends StoreNode> = {
  onSet:OnSet,
  subject: string,
  predicate :string,
  node:A,
}
export type SMethod<A extends StoreNode> = (predicate:string) => PredicateNode<A>; 
export type PredicateNode<A extends StoreNode> = {
  is: Is, 
  del: (depth?:number) => void,
  predicate: () => string,
  s: SMethod<A>,
  on: (action:(...s:Sentence[]) => void) => void,
  value: any,
}
const predicateNodeCore = (deps:PredicateNodeDeps) => <A extends StoreNode> (props:PredicateNodeProps<A>): PredicateNode<A> => {
  const {node, subject, predicate, onSet } = props;
  const { is, watcher, uuid, value } = deps;
  const match = and(has(TermType.subject)(subject), has(TermType.predicate)(predicate));
  const fallbackObject = uuid();
  const internalS = (predicateInternal) => {
    const object = value({...node, subject, predicate:predicate, onSet})();
    const newOnSet = () => {
      object ? onSet() : is({...node, onSet,subject, predicate})(fallbackObject);
    }
    return predicateNodeCore(deps)({node, subject:object|| fallbackObject, predicate:predicateInternal, onSet:newOnSet})
  }
  const del = ({subject, predicate}:{subject:string, predicate:string}) => (depth:number=0) => {
    const object = value({...node, subject, predicate, onSet:() => {}})();
    is({...node, subject, predicate, onSet:() => {}})(null);
    if (depth && object) {
      node.get(s => s.subject === object).forEach(s => del({...s})(depth-1))
    }
  }
  return Object.assign(
    value({...node, subject, predicate})
    ,{
    ...node,
    del: del({subject, predicate}),
    is: is({...node, subject, predicate, onSet}),
    value: value({...node, subject, predicate}),
    on: (action) => node.watch(watcher(action)(match(emptyContext()))),
    s: internalS,
    predicate: () => predicate,
  });
}
const predicateNode = predicateNodeCore({is:isGen, value: valueGen, watcher, uuid:v4});
export type PredicateNodeGen<A extends StoreNode> = (p:PredicateNodeProps<A>) => PredicateNode<A>;
export default predicateNode;
export {
  predicateNodeCore,
  isGen,
  valueGen,
}
