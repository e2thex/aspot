import { and, has, isGen as IsGenCore, IsGenProps, objectExists, predicateNode as predicateNodeCore, PredicateNodeProps, TermType, StoreNode, PredicateNode } from '@aspot/core';
import { useState } from 'react';

const predicateNode =<A extends StoreNode> (props:PredicateNodeProps<A>) => {
  const orginalPredicateNode = predicateNodeCore(props);
  return Object.assign(orginalPredicateNode, {
    ...orginalPredicateNode,
    use: () => {
      const [v, setV ] = useState(orginalPredicateNode.value())
      orginalPredicateNode.on((s) =>setV(s.object))
      return v;
    }
  }) as PredicateNode<A>;
}
export default predicateNode;