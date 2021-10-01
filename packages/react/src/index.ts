import { useState } from "react";
import { StoreNode, PredicateNode, SubjectNode } from "@aspot/core";

const useNode = (node:PredicateNode<StoreNode> | SubjectNode<StoreNode>) => {
  const get = 'is' in node ? node.is : node.list;
	const [v, setV ] = useState(get())
  node.on((s) =>setV(get()))
  return v;
}
export default useNode;