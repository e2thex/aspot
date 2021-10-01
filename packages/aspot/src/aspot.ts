import basicStoreNode, { TermType, StoreNode } from "./basicStoreNode";
import localConnector from "./localConnector";
import rootNode, { RootNode } from "./rootNode";
export * from './match';
import { PredicateNode } from "./predicateNode";
import { SubjectNode } from "./subjectNode";




const aspot = () => rootNode(basicStoreNode());
export {
  aspot,
  localConnector,
  TermType,
  PredicateNode,
  SubjectNode,
  StoreNode,
  RootNode,
}