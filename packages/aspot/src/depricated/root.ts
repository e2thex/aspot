import { flow } from "lodash";
import { v4 } from 'uuid';
import { MD5 } from "crypto-js";

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

type Sentences = (n?:boolean) => Sentence[];
type DateGetSet = (d?:Date) => Date;
type Updater = (u:Sentence) => void;
type ContextRecord = {
  sentences: Sentences,
  match: Match,
}
export type Context = Map<string, ContextRecord>
type Store = {
  sentences: Map<string, Sentence>,
  date: number,
}
export type UpdateResponse = 'olderThanStore' | 'olderThanCurrent' | void
export enum UpdateFailures {
  olderThanStore = 'olderThanStore',
  olderThanCurrent = 'olderThanCurrent',
}
export type StoreNode = {
  set: (...updates:Sentence[]) => UpdateResponse,
  get: (match:MatchContextualized) => Sentence[];
};
export type RootNode = StoreNode & {
  context: Context,
}
export type FindNode = RootNode & {
  find: (match:Match|string, name:string) => RootNode,
}
export type ResultNode = RootNode & {
  name: string,
  match:Match,
  context: Context,
  sentences: () => Sentence[],
  list: () => PredicateNode[],
  s: (p:string) => PredicateNode,
}
export type PredicateNode = ResultNode & {
  is: (val?:string) => string | null;
}
export type Match = (Context:Context) => (s:Sentence) => boolean
export type MatchContextualized = (s:Sentence) => boolean
type ContextNode = {
  context: (c?:Context) => Context
}

const sentences = (sentences:Map<string, Sentence>) => (includeNulls=false) => (
  includeNulls 
  ? Array.from(sentences.values()) 
  : Array.from(sentences.values()).filter(s =>s.object) 
)
const dateGetSet = (store:Store) => {
  return (dateIn?:number) => {
    if(dateIn) store.date = dateIn;
    return store.date;
  };
};
const attachContext = (context:Context=new Map()) =><A extends {}> (node:A)=> {
  return {
    ...node,
    context: (contextIn?:Context) => contextIn ? new Map([...context, ...contextIn]) : context,
  }
};
const findSentences = (from:Sentence[]) => (context:Context) => (match:Match) => (
  from.filter(match(context))
); 
const attachFind=<A extends RootNode> (node:A) => {
  const find =(node:A) => (match:Match, name:string=v4()) => {
    const { get, context } = node;
    const mergeContext = (name, sentences, match ) => ( new Map([...context,[name,{sentences, match}] ]));
    const sentences = () => get(match(context))
    const next = () => ({
      ...node,
      context: mergeContext(name, sentences, match) as Context,
      sentences,
    });
    return {
      ...next(),
      find:  (match:Match, name:string=v4()) => find(next())(match, name)
    }
  };
  // node.context = new Map(); 
  // node.find = find(node);
  const next = () =>  ({
    ...node, 
  }) ;
  return {
    ...next(),
    find: (match:Match, name:string=v4()) => find(next())(match, name)
  }
}
export {
  dateGetSet,
  attachContext,
  attachFind,
}
