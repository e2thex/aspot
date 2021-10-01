import {v4 } from 'uuid';
import basicStoreNode, {Context, StoreNode, Match, Sentence, emptyContext} from './basicStoreNode';
import resultNode, { ResultNode, ResultNodeGen } from './resultNode';
import subjectNode, { SubjectNode, SubjectNodeGen } from './subjectNode';
/*
export type ContextNode =  {
  context: Context,
}
export type RootNode = ContextNode & StoreNode & {
  find: (match:Match|string, name:string) => RootNode,
}
export type ResultNode<A extends StoreNode> = A & {
  sentences: () => Sentence[],
  context: (c:Context) => Context,
  find:  (match:Match, name:string) => ResultNode<A>, 
}
const attachContext = (context:Context=new Map()) =><A extends {}> (node:A)=> ({
  ...node,
  context: (contextIn?:Context) => contextIn ? new Map([...context, ...contextIn]) : context,
});
const attachFind=<A extends ContextNode & StoreNode> (node:A) => {
  const find =(node:A) => (match:Match, name:string=v4()):(A & ResultNode) => {
    const { get, context } = node;
    const mergeContext = (name, sentences, match ) => ( new Map([...context,[name,{sentences, match}] ]));
    const sentences = () => get(match(context))
    const next = () => ({
      ...node,
      context: mergeContext(name, sentences, match) as Context,
      sentences,
    });
    return {
      ...next(),
      find:  (match:Match, name:string=v4()) => find(next())(match, name)
    }
  };
  const next = () =>  ({
    ...node, 
  }) ;
  return {
    ...next(),
    find: (match:Match, name:string=v4()) => find(next())(match, name)
  }
}

*/
export type RootNode<A extends StoreNode> = A & {
  node: (subject) => SubjectNode<A>,
  find: (match:Match, name?:string) => ResultNode<A>,
}
type RootNodeDeps<A extends StoreNode> = {
  subjectNode:  SubjectNodeGen<A>,
  resultNode: ResultNodeGen<A>,
  uuid: () => string,
}
const rootNodeCore =<A extends StoreNode> (deps:RootNodeDeps<A>) => (node:A): RootNode<A> => {
  const { subjectNode, resultNode, uuid } = deps;
  return {
    ...node,
    find: (match:Match, name:string=uuid()) => resultNode({node, match, name, context: emptyContext()}),
    node: (subject) => subjectNode({node, subject, onSet: () => {}})
  }
}
const rootNode = rootNodeCore({subjectNode, resultNode, uuid:v4});
export default rootNode;
export {
  // attachContext,
  // attachFind,
  rootNodeCore,

}