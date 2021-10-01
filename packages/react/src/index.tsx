import { ComponentType, useContext,createContext, useState } from "react";
import { StoreNode, PredicateNode, SubjectNode, aspot, RootNode } from "@aspot/core";

const useNode = (node:PredicateNode<StoreNode> | SubjectNode<StoreNode>) => {
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
export {
  useNode,
  AspotContext,
  AspotWrapper,
  useAspotContext,
}