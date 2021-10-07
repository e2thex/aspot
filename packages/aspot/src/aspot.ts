import basicStoreNode, { TermType, StoreNode, Sentence } from "./basicStoreNode";
import localConnector from "./localConnector";
import predicateNode from "./predicateNode";
import rootNode, { RootNode } from "./rootNode";
export * from './match';
export * from './predicateNode';
export * from './subjectNode';
export * from './basicStoreNode';
export * from './resultNode';
import { SubjectNode } from "./subjectNode";




const aspot = () => rootNode(basicStoreNode());

export {
  aspot,
  localConnector,
  TermType,
  predicateNode,
  SubjectNode,
  StoreNode,
  RootNode,
  Sentence,
}