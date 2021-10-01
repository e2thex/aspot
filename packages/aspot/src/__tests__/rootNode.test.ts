// import { dateGetSet} from '../root';
// describe('dateGetSet', () => {
//   let store = {
//     date: 60,
//     sentences: new Map(),
//   }
//   const date = dateGetSet(store);
//   it('if no date returns start date', () => {
//     expect(date()).toBe(60)
//   })
//   it('if no date returns start date', () => {
//     expect(date(20)).toBe(20);
//     expect(store.date).toBe(20);
//   })
// })

import { Context, Sentence, StoreNode } from "../basicStoreNode";
import { ResultNode } from "../resultNode";
import { rootNodeCore } from "../rootNode";
import { SubjectNode } from "../subjectNode";

describe('rootNode', () => {
  const getRootNode = () => ({
    get: jest.fn((m) => [{subject:'s', predicate:'p', object:'o', date:0}]) ,
    set: jest.fn((a) => []),
    watch: jest.fn((w) => {}),
  })
  const context = new Map();
  const getReqs = () => ({
    subjectNode: jest.fn(({node, subject, onSet}) => ({} as SubjectNode<StoreNode>)),
    resultNode: jest.fn(({node, match, context, name}) => ({} as ResultNode<StoreNode>)),
    uuid: jest.fn(() => 'generateduuid'),
  });
  const getMatch = () => {
    const match0 = jest.fn((s:Sentence)=> true);
    
    const match = jest.fn((c:Context) => match0 );
    return { match, match0 }
  }
  const getContext = () => new Map() as Context;

  it('Should return a node method that will return a subject Node with the passed subject, and current node', () => {
    const reqs = getReqs()
    const node = getRootNode()
    const r = rootNodeCore(reqs)(node);
    expect(r.node('subject'))
    expect(reqs.subjectNode.mock.calls[0][0].node).toStrictEqual(node)
    expect(reqs.subjectNode.mock.calls[0][0].subject).toStrictEqual('subject')
  });
  describe('Should return a find method that will return a result node', () => {
    const reqs = getReqs()
    const node = getRootNode()
    const match = getMatch();

    const r = rootNodeCore(reqs)(node);
    expect(r.find(match.match, 'thisIsTheName'))
    it('should pass node to resultNode', () => {
      expect(reqs.resultNode.mock.calls[0][0].node).toStrictEqual(node)
    })
    it('should pass the match along to the resultNode', () => {
      expect(reqs.resultNode.mock.calls[0][0].match).toStrictEqual(match.match)
    })
    it('should pass the name along to the resultNode', () => {
      expect(reqs.resultNode.mock.calls[0][0].name).toStrictEqual('thisIsTheName')
    })
    it('should pass a empty context to the resultNode', () => {
      expect(reqs.resultNode.mock.calls[0][0].context).toStrictEqual(new Map())
    })
    it('should pass a uuid as the name if no name is provided', () => {
      expect(r.find(match.match))
      expect(reqs.resultNode.mock.calls[1][0].name).toStrictEqual('generateduuid')
    })
  })
});
