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
export type Term = 'subject' | 'object' | 'predicate'
export type GroupSentences = {
  [key:string]: Sentence[]
}
export type OnFunc = (val:string|null|PredicateNode[]) => void;
export type AspotNode = {
  s: (p?:string) => PredicateNode,
  on: (on:OnFunc) => void,
  val: () => string|PredicateNode[]|null,
  del: (depth?:number) => void,
  find: (match:Match) => SentenceResult,
}
export type PredicateNode = AspotNode & {
  is: (o:string) => void,
  list: () => SubjectNode,
  predicate: () => string,
}
export type SubjectNode = AspotNode & {
}
export type Find = (match:Match, c?:MatchContext) => SentenceResult;

export type SentenceFunc = (() => Sentence | null) & {
  object: () => string| null,
  predicate: () => string| null,
  subject: () => string| null,
  part: (part:Term) => string| null,
}
export type OnIs = () => void;
export type SentenceResult = {
  subjectAsNode: () => SubjectNode[],
  objectAsNode: () => PredicateNode[],
  asNode?: (w:Term) => SubjectNode[]|PredicateNode[];
  subjectAsNodeOnce: () => SubjectNode | null,
  objectAsNodeOnce: () => PredicateNode | null,
  sentences: () => Sentence[],
  sentence: SentenceFunc
  groupBy: (on:Term) => GroupResult,
  next: (match:Match, context?:MatchContext) => SentenceResult
}
export type WhereMatch = (sentences:Sentence[], context?:MatchContext) => boolean;
export type GroupResult = {
  sentences: () => Sentence[],
  having: (match:WhereMatch, context?:MatchContext) => GroupResult,
  asNode: () => SubjectNode[],
  degroup: () => SentenceResult,
}
export type UpdateFuc = (u:Sentence) => void;
export type Database = {
  sentences: Sentence[];
  date: number;
}
export type NodeProps = {
  update: UpdateFuc,
  find: Find,
  node: (s?:string) => SubjectNode,
  addWatcher: (w:Watcher) => void;
  reset: (newDb:Database) => void;
}
export enum CountOps  {
  equals = "=",
  greaterThan = ">",
  greaterThanOrEqual = ">=",
  lessThan = "<",
  lessThanOrEqual = "<=",
}
export type Compare = '>' | '<' | '=' | '<=' | '>=';
export type MatchContext = {
  sentences: {
    [name:string]: Sentence[];
  }
}
export type  Watcher = (s:Sentence) => void;
export type MatchFuncSimple = (s:Sentence) => boolean;
export type MatchFunc = (s:Sentence, matchContext?:MatchContext) => boolean;
export type MatchWithMeta = MatchFunc & {
  and: (m:Match) => MatchFunc
  or: (m:Match) => MatchFunc
  simple: MatchFuncSimple
};
export type Match = MatchFunc | MatchWithMeta