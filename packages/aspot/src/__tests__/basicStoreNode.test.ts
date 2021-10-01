import { exportAllDeclaration } from '@babel/types';
import { WatchDirectoryFlags } from 'typescript';
import basicStoreNode, { Sentence, sentenceKey, StoreNode, UpdateFailures, watcher } from '../basicStoreNode';
describe('BasicStoreNode', () => {
  const mkstore = (sentences:Sentence[], date) => ({
    sentences: new Map(sentences.map(s => [sentenceKey(s), s])),
    date
  })
  describe('set', () => {
    it('should do nothing if the date of the sentence is older the the date and not call watchers', () => {
      const store = mkstore([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ], 10);
      const sentence = {subject: 'y', predicate: 'b', object: 'z', date:5} 
      expect(basicStoreNode(store).set(sentence)[0]).toBe(UpdateFailures.olderThanStore);
      expect(basicStoreNode(store).set(sentence)[0]).toBe(UpdateFailures.olderThanStore);
      expect(Array.from(store.sentences.values())).toStrictEqual([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ])
    })
    it('should do nothing if the date of the sentence is older then the matching sentence', () => {
      const store = mkstore([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ], 10);
      const sentence = {subject: 'a', predicate: 'b', object: 'z', date:45} 
      expect(basicStoreNode(store).set(sentence)[0]).toBe(UpdateFailures.olderThanCurrent);
      expect(Array.from(store.sentences.values())).toStrictEqual([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ])
    })
    it('otherwise it should remove a match and add it self', () => {
      const store = mkstore([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ], 10);
      const sentence = {subject: 'a', predicate: 'b', object: 'z', date:70} 
      expect(basicStoreNode(store).set(sentence)[0]).toBeFalsy();
      expect(Array.from(store.sentences.values())).toStrictEqual([
        {subject: 'd', predicate: 'e', object: 'f', date:60},
        {subject: 'a', predicate: 'b', object: 'z', date:70},
      ])
    })
    it('if the sentence is new it should just add it.', () => {
      const store = mkstore([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ], 10)
      const date = 10;
      const sentence = {subject: 'a', predicate: 'k', object: 'z', date:70} 
      expect(basicStoreNode(store).set(sentence)[0]).toBeFalsy();
      expect(Array.from(store.sentences.values())).toStrictEqual([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
        {subject: 'a', predicate: 'k', object: 'z', date:70},
      ])
    })
  })
  describe('get', () => {
    const store = mkstore([
      {subject: 'a', predicate: 'b', object: 'c', date:50},
      {subject: 'd', predicate: 'e', object: 'f', date:60},
    ], 10)
    it('should return all sentences that match', () => {
      expect(basicStoreNode(store).get(() => true)).toStrictEqual([
        {subject: 'a', predicate: 'b', object: 'c', date:50},
        {subject: 'd', predicate: 'e', object: 'f', date:60},
      ]);
    });
    it('should return empty of no matches', () => {
      expect(basicStoreNode(store).get(() => false)).toStrictEqual([
      ]);
    });
  });
  describe('watch', () => {
    const store = mkstore([
      {subject: 'a', predicate: 'b', object: 'c', date:50},
      {subject: 'd', predicate: 'e', object: 'f', date:60},
    ], 10);
    const sentences = [
      {subject: 'a', predicate: 'b', object: 'z', date:70},
      {subject: 'd', predicate: 'e', object: 'z', date:40},
      {subject: 'f', predicate: 'j', object: 'f', date:5},
      {subject: 'l', predicate: 'm', object: 'n', date:70},
    ]
    const watcher = jest.fn((...n) => {})
    const n = basicStoreNode(store);
    n.watch(watcher);
    const r = n.set(...sentences);
    it('Should pass any sentence to the watcher that is updated (and not ones rejected)', () => {
      expect(watcher.mock.calls[0][0]).toStrictEqual(sentences.filter((s,i) => !r[i] )[0])
      expect(watcher.mock.calls[0][1]).toStrictEqual(sentences.filter((s,i) => !r[i] )[1])

    })
    
  })
  it('Should have a contect method that takes a function that takes our node and then calls that function and returns it self', () => {
    const sNode = basicStoreNode();
    const connector = jest.fn((node:StoreNode) => {});
    expect(sNode.connect(connector)).toStrictEqual(sNode);
    expect(connector.mock.calls[0][0]).toStrictEqual(sNode);
  });
});
describe("watcher", () => {
  it('should call action when match returns true on a sentence and it should return the sentence on which it ws true', () => {
    const action = jest.fn((...s) => {});
    const t = jest.fn((s) => true);
    const w = watcher(action)(t);
    w({subject:'s', predicate:'p', object:'o', date:0});
    expect(action.mock.calls[0][0]).toStrictEqual({subject:'s', predicate:'p', object:'o', date:0})
  })
  it('should not call action if there is no match', () => {
    const action = jest.fn((...s) => {});
    const t = jest.fn((s) => false);
    const w = watcher(action)(t);
    w({subject:'s', predicate:'p', object:'o', date:0});
    expect(action).toBeCalledTimes(0);
  })
})