import { Context, Match, MatchContextualized, Sentence, sentenceKey, StoreNode } from "../basicStoreNode";
import resultNode, { resultNodeGen } from "../resultNode";
import { SubjectNode } from "../subjectNode";
import { PredicateNode } from "../predicateNode";

describe('ResultNode', () => {
  const getRootNode = () => ({
    get: jest.fn((m) => [{subject:'s', predicate:'p', object:'o', date:0}]) ,
    set: jest.fn((a) => []),
    watch: jest.fn((w) => {}),
    connect: jest.fn(c => ({}) as StoreNode),
    a: 'b'
  })
  const context = new Map();
  const getReqs = () => ({
    subjectNode: jest.fn(({node, subject, onSet}) => ({} as SubjectNode<StoreNode>)),
    predicateNode: jest.fn(({node, subject, prediate, onSet}) => ({} as PredicateNode<StoreNode>)),
    uuid: jest.fn(() => ''),
  });
  const getMatch = () => {
    const match0 = jest.fn((s:Sentence)=> true);
    
    const match = jest.fn((c:Context) => match0 );
    return { match, match0 }
  }
  const getContext = () => new Map() as Context;

  it('returns a new node that keeps the properties of the node passed in', () => {
    const node = resultNodeGen(getReqs())({node:getRootNode(), match: getMatch().match, context:getContext(), name:'m' });
    // expect(node.a).toBe('b');

  });
  it('returns a setence function which returns the result from get using the context and the match', () => {
    const node = getRootNode();
    const context = getContext();
    const {match, match0} = getMatch();
    
    const r = resultNodeGen(getReqs())({node, match, context, name:'m' });
    expect(r.sentences()).toStrictEqual([{subject:'s', predicate:'p', object:'o', date:0}]);
    expect(match.mock.calls[0][0]).toStrictEqual(context);
    expect(node.get.mock.calls[0][0]).toStrictEqual(match0);
  })
  it('return a context with any previous context item as well as a new one with title, and match as well as sentence function', () => {
    const node = getRootNode();
    const context = new Map([['old', {sentences:() => [], match:(c) => (s) => false}]]);
    const {match, match0} = getMatch();
    const r = resultNodeGen(getReqs())({node, match, context, name:'new' });
    expect(r.context.get('new').sentences()).toStrictEqual([{subject:'s', predicate:'p', object:'o', date:0}]);
    expect(match.mock.calls[0][0]).toStrictEqual(context);
    expect(node.get.mock.calls[0][0]).toStrictEqual(match0);
    expect(r.context.get('new').match).toStrictEqual(match);
    expect(Array.from(r.context.keys())).toStrictEqual(['old', 'new']);
  })
  it('returns a nodes function which will return subjectNodes with the subject of each sentence', () => {
    const reqs = getReqs();
    const node = getRootNode();
    const context = new Map([['old', {sentences:() => [], match:(c) => (s) => false}]]);
    const {match, match0} = getMatch();
    const r = resultNodeGen(reqs)({node, match, context, name:'new' }); 
    expect(r.nodes().length).toBe(1);
    expect(reqs.subjectNode.mock.calls[0][0].subject).toBe('s');
    expect(reqs.subjectNode.mock.calls[0][0].node).toStrictEqual(node);
  })
  it('returns a list function which will return predictNodes with the subject and predicate of each sentence', () => {
    const reqs = getReqs();
    const node = getRootNode();
    const context = new Map([['old', {sentences:() => [], match:(c) => (s) => false}]]);
    const {match, match0} = getMatch();
    const r = resultNodeGen(reqs)({node, match, context, name:'new' }); 
    expect(r.list().length).toBe(1);
    expect(reqs.predicateNode.mock.calls[0][0].subject).toBe('s');
    expect(reqs.predicateNode.mock.calls[0][0].predicate).toBe('p');
    expect(reqs.predicateNode.mock.calls[0][0].node).toStrictEqual(node);
  })
  it.todo('returns a find function that will return a new version of itself');
});