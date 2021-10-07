import { Sentence, StoreNode, WatcherGen, watcher, StoreGet } from './basicStoreNode'
import { objectExists } from './match';
import predicateNode, { OnSet, PredicateNode, PredicateNodeGen, SMethod, Value, ValueDepth, valueGen } from './predicateNode';
export type SubjectValueGenProps = {
  subject: string,
  get: StoreGet,
}
export type SubjectValueGen = (props:SubjectValueGenProps) => Value 
const subjectValueGen = ({get, subject}:SubjectValueGenProps) => {
  function val():string | null
  function val(depth:number):ValueDepth
  function val(depth?:number) {
    if(!depth) return subject
    const sentences = get(s => s.subject === subject) 
    return sentences.reduce((result, s) => ({
      ...result,
      [s.predicate]:  valueGen({get, subject:s.subject, predicate:s.predicate})(depth > 1 ? depth - 1 : undefined)
    })
    ,{} as ValueDepth)

  }
  return val as Value
}

export type SubjectNode<A extends StoreNode> = {
  s: SMethod<A>,
  list: () => PredicateNode<A>[],
  on: (action:(...s:Sentence[]) => void) => void,
  value: any;
}
type SubjectNodeProps<A extends StoreNode> = {
  node: A,
  subject:string,
  onSet:OnSet,
}
type SubjectNodeReq<A extends StoreNode> = {
  predicateNode: PredicateNodeGen<A>,
  watcher: WatcherGen,
  value: SubjectValueGen,

}
export type SubjectNodeGen<A extends StoreNode> = (props:SubjectNodeProps<A>) => SubjectNode<A> ;
const subjectNodeCore =<A extends StoreNode> (reqs:SubjectNodeReq<A>) => (props:SubjectNodeProps<A>):SubjectNode<A> => {
  const { predicateNode, watcher, value } = reqs;
  const { node, subject, onSet } = props;
  return Object.assign( value({...node, subject}), {
    ...node,   
    s: (predicate:string) => predicateNode({onSet, subject, node, predicate}),
    on: (action) => node.watch(watcher(action)((s) => s.subject === subject)),
    list: () => node.get((s) => (s.subject === subject) && (s.object !== null)).map(s => predicateNode({onSet, subject, node, predicate:s.predicate})),
    value: value({...node, subject}),
  })
}
const subjectNode = subjectNodeCore({predicateNode, watcher, value: subjectValueGen});
export default subjectNode;
export {
  subjectNodeCore,
}