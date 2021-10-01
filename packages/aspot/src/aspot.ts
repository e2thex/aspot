import basicStoreNode from "./basicStoreNode";
import localNode from "./localNode";
import rootNode from "./rootNode";
export * from './match';



const aspot = () => rootNode(basicStoreNode());
const aspotLocal = (name:string) => rootNode(localNode(name)(basicStoreNode()));
export {
  aspot,
  aspotLocal,
}