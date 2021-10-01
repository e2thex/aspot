/*
import { v4 } from "uuid";
import { emptyContext, StoreNode, TermType, watcher, Match, StoreGet, StoreSet, WatcherGen } from "./basicStoreNode";
import { and, has } from "./match";
import { Sentence } from "./types";
export type OnSet = () => void;
export type isNode = {
  is: (o?) => string | null | void,
}
export type sNode = {
  s: (p) => PredicateNode, 
}
export type delNode = {
  del: () => void, 
}
export type onNode = {
  on: (action:(...s:Sentence[]) => void) => void,
}

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
  onSet();
  return set({subject, predicate, object, date:Date.now()})[0]
}

type PredicateNodeDeps = {
  is: IsGen,
  watcher: WatcherGen,
}
type PredicateNodeProps<A extends StoreNode> = {
  onSet:OnSet,
  subject: string,
  predicate :string,
  node:A,
}
export type PredicateNode<A extends StoreNode> = {
  is: Is, 
  s: (p) => PredicateNode<A>,
  del: () => void,
  on: (action:(...s:Sentence[]) => void) => void,
}
const predicateNodeCore = (deps:PredicateNodeDeps) => <A extends StoreNode> (props:PredicateNodeProps<A>): PredicateNode<A> => {
  const {node, subject, predicate, onSet } = props;
  const { is, watcher } = deps;
  const match = and(has(TermType.subject)(subject), has(TermType.predicate)(predicate));
  const internalS = (predicate) => {
    const object = is({...node, subject, predicate, onSet})();
    const fallbackObject = v4();
    const newOnSet = () => {
      object ? onSet() : is({...node, onSet,subject, predicate})(fallbackObject);
    }
    return predicateNodeCore(deps)({node, subject:object|| fallbackObject, predicate, onSet:newOnSet})
  }
  return {
    ...node,
    del: () => is({...node, subject, predicate, onSet})(null),
    is: is({...node, subject, predicate, onSet}),
    on: (action) => node.watch(watcher(action)(match(emptyContext()))),
    s: internalS,
  }
}
// not tested
const predicateNode = predicateNodeCore({is:isGen, watcher});
type SMethodGen<A extends StoreNode> = (p:Omit<PredicateNodeProps<A>,'predicate'>) => SMethod<A>;
// not tested
const s:SMethodGen<StoreNode> = (props) => (predicate:string) => predicateNode({...props, predicate});

type ListDeps = {
  predicateNode: PredicateNode,
}
type ListProps<A extends StoreNode> = {
  subject: string,
  node: A,
}
const listGen = (predicateNode) => <A extends StoreNode> (props:ListProps<A>):PredicateNode[] => {
  const { subject, node} = props;
  return node.get(s => s.subject === subject).map(s => predicateNode({...s, onSet:() => {}, node}));
}
export type  SubjectNode<A extends StoreNode> = {
  s: SMethod<A>,
  // list: () => PredicateNode[],
}
type SubjectNodeProps<A extends StoreNode> = {
  node: A,
  subject:string,
  onSet:OnSet,
}
export type SubjectNodeGen<A extends StoreNode> = (props:SubjectNodeProps<A>) => SubjectNode<A> ;
const subjectNode =<A extends StoreNode> (props:SubjectNodeProps<A>):SubjectNode<A> => {
  const { node, subject, onSet } = props;
  return ({
    ...node,   
    s: s({onSet, subject, node}) 
  })
}
const attachIs = (onSet:OnSet=() => {}) => (subject:string)=> (predicate:string) => <A extends StoreNode> (node:A) => {
  return ({
    ...node,
    is:  isGen({...node, onSet, subject, predicate})
  }) as A & isNode;
}
const attachS = (subject:string) => <A extends StoreNode> (node:A) => {
  const fallbackObject = v4();
  return ({
    ...node,
    s: s({onSet: ()=>{}, subject, node}),
  })
}
const attachOn =<A extends StoreNode> (match:Match) => (node:A) => {
  return (
    {
      ...node,
      on: (action) => node.watch(watcher(action)(match(emptyContext())))
    }
  )
}
const attachDel = <A extends isNode> (node:A) => ({
  ...node,
  del: () => node.is(null),
})

export {
  attachDel,
  attachOn,
  attachIs,
  attachS,
  subjectNode,
}
*/