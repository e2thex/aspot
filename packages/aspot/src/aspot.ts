import basicStoreNode, { TermType, StoreNode } from "./basicStoreNode";
import localNode from "./localNode";
import rootNode from "./rootNode";
export * from './match';
import { PredicateNode } from "./predicateNode";
import { SubjectNode } from "./subjectNode";




const aspot = () => rootNode(basicStoreNode());
const aspotLocal = (name:string) => rootNode(localNode(name)(basicStoreNode()));
export {
  aspot,
  aspotLocal,
  TermType,
  PredicateNode,
  SubjectNode,
  StoreNode,
}