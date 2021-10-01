import { MD5 } from 'crypto-js';
export type Sentence = {
	subject: string,
	object: string|null,
	predicate: string,
  date: number,
};
export enum TermType {
  subject = 'subject',
  object = 'object',
  predicate = 'predicate',
};
export type Term = 'subject' | 'object' | 'predicate';
type Store = {
  sentences: Map<string, Sentence>,
  date: number,
}
type UpdateResponse = 'olderThanStore' | 'olderThanCurrent' | void
export enum UpdateFailures {
  olderThanStore = 'olderThanStore',
  olderThanCurrent = 'olderThanCurrent',
}
export type Sentences = () => Sentence[];
type ContextRecord = {
  sentences: Sentences,
  match: Match,
}
export type Context = Map<string, ContextRecord>
export type MatchContextualized = (s:Sentence) => boolean;
export type Match = (Context:Context) => MatchContextualized;
export type Watcher = (...s:Sentence[]) => void;
export type StoreSet = (...updates:Sentence[]) => UpdateResponse[];
export type StoreGet = (match:MatchContextualized) => Sentence[]; 
export type StoreWatch = (w:Watcher) => void;

const emptyContext = () => new Map() as Context;
const emptyStore = () => ({ sentences: new Map(), date:0 }) as Store;
const sentenceKey = (sentence:Sentence) => MD5(JSON.stringify([sentence.subject,  sentence.predicate])).toString() 
type BasicStoreNodeDeps = {
  sentenceKey: (sentence:Sentence) => string
}
export type StoreNode = {
  set: (...updates:Sentence[]) => UpdateResponse[],
  get: (match:MatchContextualized) => Sentence[],
  watch: StoreWatch,
};
const basicStoreNodeCore = (deps:BasicStoreNodeDeps) => (store:Store=emptyStore()):StoreNode => {
  const {sentenceKey } = deps;
  const setSentence = (store:Store)=> (update:Sentence):UpdateResponse => {
    const { sentences, date } = store;
    if (update.date <= date) return UpdateFailures.olderThanStore;
    const key = sentenceKey(update);
    if(sentences.has(key)) {
      if(sentences.get(key).date >= update.date) return UpdateFailures.olderThanCurrent ;
      sentences.delete(key);
    }
    sentences.set(key, update);
  }
  const watchers = [] as Watcher[];
  const set =  (...updates: Sentence[]) => {
    const results = updates.map(setSentence(store));
    const changes = updates.filter((u, i) => !results[i]);
    watchers.forEach(watcher => watcher(...changes));
    return results;
  }
  return ({
    set, 
    get: (match:MatchContextualized) => Array.from(store.sentences.values()).filter(match),
    watch: (watcher:Watcher) => { watchers.push(watcher)},
  });
}
const basicStoreNode = basicStoreNodeCore({sentenceKey});
export type WatcherGen= (action:(...s:Sentence[])=> void) => (match:MatchContextualized) => Watcher;
const watcher = (action:(...s:Sentence[])=> void) => (match:MatchContextualized) => (...sentences:Sentence[]) => {
  const hits = sentences.filter(match)
  if(hits.length > 0) action(...hits);
};
export default basicStoreNode;
export {
  sentenceKey,
  watcher,
  emptyContext,
};