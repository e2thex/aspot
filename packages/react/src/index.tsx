import { ComponentType, useContext, createContext, useState, useEffect, useRef } from "react";
import { StoreNode, PredicateNode, SubjectNode, aspot, RootNode, SubjectNodeGen, subjectNodeCore, watcher, resultNodeGen, subjectValueGen } from "@aspot/core";
import predicateNode from './predicateNode';
import { rootNodeCore } from "@aspot/core/lib/rootNode";
import { v4 } from "uuid";
import basicStoreNode from "@aspot/core/lib/basicStoreNode";

function useNode<A extends StoreNode>(node: PredicateNode<A> | SubjectNode<A>) {
	const [v, setV] = useState(node.value());
	const nodeRef = useRef(node);
	
	useEffect(() => {
		// Set initial value
		setV(node.value());
		
		// Subscribe to changes
		node.on((s) => setV(node.value()));
		
		// Note: The current system doesn't support unsubscribing
		// This is a limitation of the current architecture
	}, [node]);
	
	return v;
}

function useNodeList<A extends StoreNode>(node: PredicateNode<A> | SubjectNode<A>) {
	const [v, setV] = useState(node.list());
	
	useEffect(() => {
		// Set initial value
		setV(node.list());
		
		// Subscribe to changes
		node.on((s) => setV(node.list()));
		
		// Note: The current system doesn't support unsubscribing
		// This is a limitation of the current architecture
	}, [node]);
	
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
const subjectNode = subjectNodeCore({predicateNode, watcher, value:subjectValueGen})
const resultNode = resultNodeGen({subjectNode, predicateNode, uuid:v4})
const rootNode = rootNodeCore({subjectNode, resultNode, uuid:v4})
const asopt = rootNode(basicStoreNode());
export default aspot;
export {
  useNode,
  AspotContext,
  AspotWrapper,
  useAspotContext,
  useNodeList,
}