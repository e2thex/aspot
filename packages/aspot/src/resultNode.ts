import { Context, Match, Sentences, StoreNode } from "./basicStoreNode";
import subjectNode, { SubjectNode, SubjectNodeGen } from "./subjectNode";
import predicateNode, { PredicateNode, PredicateNodeGen } from "./predicateNode";
import { v4 } from "uuid";
import {  } from "./subjectNode";

type Find<A extends StoreNode> = (match:Match, name:string) => ResultNode<A> 
export type ResultNode<A extends StoreNode> = {
  context: Context,
  sentences: Sentences,
  find: Find<A>,
  nodes: () => SubjectNode<A>[],
  list: () => PredicateNode<A>[],
}
type ResultNodeProps<A extends StoreNode> = {
  node:A,
  match:Match,
  name:string
  context:Context
}
export type ResultNodeReqs<A extends StoreNode> = {
  uuid: ()=> string,
  subjectNode: SubjectNodeGen<A>,
  predicateNode: PredicateNodeGen<A>,
}
export type ResultNodeGen <A extends StoreNode> = (p:ResultNodeProps<A>) => ResultNode<A>
const resultNodeGen = <A extends StoreNode> (reqs:ResultNodeReqs<A>) =>(props:ResultNodeProps<A>):( A & ResultNode<A>) => {
  const { uuid, subjectNode, predicateNode } = reqs;
  const { node, match , name, context } = props;
  const { get } = node;
  const sentences = () => get(match(context))
  const mergedContext = ( new Map([...context,[name,{sentences, match}] ]))
  return  ({
    ...node,
    context: mergedContext,
    sentences,
    find: (match:Match, name:string=uuid()) => resultNodeGen(reqs)({node, match, name, context: mergedContext}),
    nodes: () => sentences().map(s => subjectNode({subject:s.subject, node, onSet:() => {}})),
    list: () => sentences().map(s => predicateNode({node, ...s, onSet:() =>{}, }))
  });
};
const resultNode = resultNodeGen({uuid:v4, subjectNode, predicateNode});
export default resultNode;
export {
  resultNodeGen,
}