import { and, has, isGen as IsGenCore, IsGenProps, objectExists, predicateNode as predicateNodeCore, PredicateNodeProps, TermType, StoreNode } from '@aspot/core';
import { useState } from 'react';

const predicateNode =<A extends StoreNode> (props:PredicateNodeProps<A>) => {
  const orginalPredicateNode = predicateNodeCore(props);
  return {
    ...orginalPredicateNode,
    is: Object.assign(orginalPredicateNode.is, {
      use: () => {
        const [v, setV ] = useState(orginalPredicateNode.is())
        orginalPredicateNode.on((s) =>setV(s.object))
        return v;
      }
    })

  }
}
export default predicateNode;