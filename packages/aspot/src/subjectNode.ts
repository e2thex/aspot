import { Sentence, StoreNode, WatcherGen, watcher } from './basicStoreNode'
import { objectExists } from './match';
import predicateNode, { OnSet, PredicateNode, PredicateNodeGen, SMethod } from './predicateNode';
export type SubjectNode<A extends StoreNode> = {
  s: SMethod<A>,
  list: () => PredicateNode<A>[],
  on: (action:(...s:Sentence[]) => void) => void,
}
type SubjectNodeProps<A extends StoreNode> = {
  node: A,
  subject:string,
  onSet:OnSet,
}
type SubjectNodeReq<A extends StoreNode> = {
  predicateNode: PredicateNodeGen<A>,
  watcher: WatcherGen,
}
export type SubjectNodeGen<A extends StoreNode> = (props:SubjectNodeProps<A>) => SubjectNode<A> ;
const subjectNodeCore =<A extends StoreNode> (reqs:SubjectNodeReq<A>) => (props:SubjectNodeProps<A>):SubjectNode<A> => {
  const { predicateNode, watcher } = reqs;
  const { node, subject, onSet } = props;
  return ({
    ...node,   
    s: (predicate:string) => predicateNode({onSet, subject, node, predicate}),
    on: (action) => node.watch(watcher(action)((s) => s.subject === subject)),
    list: () => node.get((s) => (s.subject === subject) && (s.object !== null)).map(s => predicateNode({onSet, subject, node, predicate:s.predicate}))
  })
}
const subjectNode = subjectNodeCore({predicateNode, watcher});
export default subjectNode;