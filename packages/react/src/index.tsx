import { ComponentType, useContext,createContext, useState } from "react";
import { StoreNode, PredicateNode, SubjectNode, aspot, RootNode, SubjectNodeGen, subjectNodeCore, watcher, resultNodeGen } from "@aspot/core";
import predicateNode from './predicateNode';
import { rootNodeCore } from "@aspot/core/lib/rootNode";
import { v4 } from "uuid";
import basicStoreNode from "@aspot/core/lib/basicStoreNode";

function useNode<A extends StoreNode>(node:PredicateNode<A>):string | null 
function useNode<A extends StoreNode>(node:SubjectNode<A>):PredicateNode<A>[] 
function useNode<A extends StoreNode>(node:PredicateNode<A> | SubjectNode<A>)  {
  const get = 'is' in node ? node.is : node.list;
	const [v, setV ] = useState(get())
  node.on((s) =>setV(get()))
  return v;
}
const AspotContext = createContext(aspot());
const useAspotContext = () => useContext(AspotContext);
type Props = {
  node: RootNode<StoreNode>,
  children:any
};
const AspotWrapper = <A extends StoreNode>(props:Props) => {
	const {node, children} = props;
  return (
    <AspotContext.Provider value={node}>
      {children}
    </AspotContext.Provider>
  );

};
const subjectNode = subjectNodeCore({predicateNode, watcher})
const resultNode = resultNodeGen({subjectNode, predicateNode, uuid:v4})
const rootNode = rootNodeCore({subjectNode, resultNode, uuid:v4})
const asopt = rootNode(basicStoreNode());
export default aspot;
export {
  useNode,
  AspotContext,
  AspotWrapper,
  useAspotContext,
}