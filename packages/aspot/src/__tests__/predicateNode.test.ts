import { MatchContextualized, StoreNode, Watcher } from "../basicStoreNode";
import { predicateNodeCore, PredicateNodeDeps } from "../predicateNode"

describe("predicateNodeCore", () => {
  const getRootNode = () => ({
    get: jest.fn((m) => [{subject:'s', predicate:'p', object:'o', date:0}]) ,
    set: jest.fn((a) => []),
    watch: jest.fn((w) => {}),
    connect: jest.fn(c => ({}) as StoreNode),
    a: 'b'
  })
  describe("del method", () => {
    it('should call the is func with the current subject predicate and then a null object', ()=> {
      const watcher0 = jest.fn((m:MatchContextualized) => ({}) as Watcher);
      const is = jest.fn((o?:string) => {})
      const valuef = jest.fn(() => 'o')
      const deps = {
        is: jest.fn(({onSet, subject, predicate, get, set}) => is),
        value: jest.fn(({subject, predicate, get}) => valuef),
        watcher: (a) => watcher0,
        uuid: () => 'uuid', 
      };
      const node = getRootNode()
      const n = predicateNodeCore(deps)({onSet:() => {}, subject:'s', predicate:'p', node})
      n.del();
      expect(deps.is.mock.calls[0][0].subject).toBe('s');
      expect(deps.is.mock.calls[0][0].predicate).toBe('p');
      expect(is.mock.calls[0][0]).toBeNull();
    })
    it('if it has depth it should get new sentences that mactch the subject and call it with null on them to the supplyed depth', () => {

      const watcher0 = jest.fn((m:MatchContextualized) => ({}) as Watcher);
      const is = jest.fn((o?:string) => {})
      const valuef = jest.fn(() => 's')
      const deps = {
        is: jest.fn(({onSet, subject, predicate, get, set}) => is),
        value: jest.fn(({subject, predicate, get}) => valuef),
        watcher: (a) => watcher0,
        uuid: () => 'uuid', 
      };
      const node = getRootNode()
      const n = predicateNodeCore(deps)({onSet:() => {}, subject:'s0', predicate:'p0', node})
      n.del(1);
      expect(deps.is.mock.calls[0][0].subject).toBe('s0');
      expect(deps.is.mock.calls[0][0].predicate).toBe('p0');
      expect(is.mock.calls[0][0]).toBeNull();
      // TODO thisis a flaw not sure why there is a 2 here works
      expect(deps.is.mock.calls[2][0].subject).toBe('s');
      expect(deps.is.mock.calls[2][0].predicate).toBe('p');
      expect(is.mock.calls[1][0]).toBeNull();
    })
  })
})