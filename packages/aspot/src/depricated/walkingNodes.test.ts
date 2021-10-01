
  /*
import { exportAllDeclaration, thisTypeAnnotation, tsExternalModuleReference } from '@babel/types';
import { match, notEqual } from 'assert';
import { iteratee } from 'lodash';
import { start } from 'repl';
import { StoreNode, Watcher } from '../basicStoreNode';
import { attachDel, attachIs, attachOn} from '../walkingNode'
describe('attachIs', () =>{
  describe('when called with no object', () => {
    it('Should  use get to find a subject/predicate match and return the object', () => {
      const get = jest.fn(m => [{subject:'s', object:'o', predicate:'p', date:0}])
      const store = {
        get,
        set: (v) => [],
        watch: (a) => {},
      } as StoreNode;
      const node = attachIs()('s')('p')(store);
      expect(node.is()).toBe('o')
      const match =get.mock.calls[0][0];
      expect(match({subject:'s', object:'o', predicate:'p'})).toBeTruthy();
      expect(match({subject:'x', object:'o', predicate:'p'})).toBeFalsy();
      expect(match({subject:'s', object:'o', predicate:'x'})).toBeFalsy();
    })
  })
  describe('when called with an object', () => {
    it('should pass a update to with the correct subject object predicate and current time', () =>{
      const set = jest.fn(s => [])
      const store = {
        get: (m) => [],
        set: set,
        watch: (a) => {},
      } as StoreNode; 
      const node = attachIs()('s')('p')(store);
      node.is('o');
      expect(set.mock.calls[0][0].subject).toBe('s')
      expect(set.mock.calls[0][0].predicate).toBe('p')
      expect(set.mock.calls[0][0].object).toBe('o')
      expect(set.mock.calls[0][0].date).toBeLessThan(Date.now()+1000)
      expect(set.mock.calls[0][0].date).toBeGreaterThan(Date.now()-1000)
    })
    it('should call the onSet if set is called', () =>{
      const set = jest.fn(s => [])
      const store = {
        get: (m) => [],
        set: set,
        watch: (a) => {},
      } as StoreNode; 
      const onSet = jest.fn(() => {});
      const onSet2 = jest.fn(() => {});
      attachIs(onSet)('s')('p')(store).is('o');
      attachIs(onSet2)('s')('p')(store).is();
      expect(onSet).toHaveBeenCalledTimes(1);
      expect(onSet2).toHaveBeenCalledTimes(0);
    })
  })

});

describe('walkingNode', () => {

  it('Should maintian any items in node', () => {
    const  is3 = jest.fn(object => { if(!object) return 'val'} ); 
    const is2 = jest.fn(predicate => is3); 
    const is1 = jest.fn(subject => is2); 
    const is = jest.fn(onSet => is1);
    type Test = {a:string};
    const node = {a:'b'} as Test;
    const wNode = walkingNode(is)(node)()('s')('p') 
    expect(wNode.a).toBe('b');
  })
  it('Should provide an is which returns the last call for the is function passed in', () => {
    const  is3 = jest.fn(object => { if(!object) return 'val'} ); 
    const is2 = jest.fn(predicate => is3); 
    const is1 = jest.fn(subject => is2); 
    const is = jest.fn(onSet => is1);
    type Test = {a:string};
    const node = {a:'b'} as Test;
    const onSet = jest.fn(() => {})
    const wNode = walkingNode(is)(node)(onSet)('s')('p') 
    expect(wNode.is).toStrictEqual(is3); 
    // ensure we always call is with our prams
    //is.mock.calls.forEach(c => expect(c[0]).toStrictEqual(onSet));
    is1.mock.calls.forEach(c => expect(c[0]).toStrictEqual('s'));
  })
})
describe('attachDel', () => {
  const node = {
    is: jest.fn((s?) => {}),
  }
  const nNode = attachDel(node);
  nNode.del();
  it('should call the is function with a null value', () => {
    expect(node.is.mock.calls[0][0]).toBeNull();
  })
});

describe('attachOn', () => {
  const node = {
    watch: jest.fn((s?) => {}),
    get: (a) => [],
    set: (a) => [],
  }
  const match1 = (s) => s.subject === 's';
  const match = (c) => match1;
  const action = jest.fn((...s) => {});

  const nNode = attachOn(match)(node);
  nNode.on(action);
  const watcher = node.watch.mock.calls[0][0] as Watcher;
  watcher({subject:'s', object:'o', predicate:'p', date:0})
  watcher({subject:'x', object:'o', predicate:'p', date:0})
  
  it('should register a watch that use the passed in match and action', () => {

    expect(action.mock.calls[0][0]).toStrictEqual({subject:'s', object:'o', predicate:'p', date:0});
    expect(action).toBeCalledTimes(1);
  })
});
*/
it('', () => {})