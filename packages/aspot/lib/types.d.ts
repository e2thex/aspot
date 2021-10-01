export declare type Sentence = {
    subject: string;
    object: string | null;
    predicate: string;
    date: number;
};
export declare enum TermType {
    subject = "subject",
    object = "object",
    predicate = "predicate"
}
export declare type Term = 'subject' | 'object' | 'predicate';
export declare type GroupSentences = Record<string, Sentence[]>;
export declare type OnFunc = (val: string | null | PredicateNode[]) => void;
export declare type AspotNode = {
    s: (p?: string) => PredicateNode;
    on: (on: OnFunc) => void;
    val: () => string | PredicateNode[] | null;
    del: (depth?: number) => void;
    find: (match: Match) => SentenceResult;
};
export declare type PredicateNode = AspotNode & {
    is: (o: string) => void;
    list: () => SubjectNode;
    predicate: () => string;
};
export declare type SubjectNode = AspotNode & {};
export declare type Find = (match: Match, c?: MatchContext) => SentenceResult;
export declare type SentenceFunc = (() => Sentence | null) & {
    object: () => string | null;
    predicate: () => string | null;
    subject: () => string | null;
    part: (part: Term) => string | null;
};
export declare type OnIs = () => void;
export declare type SentenceResult = {
    subjectAsNode: () => SubjectNode[];
    objectAsNode: () => PredicateNode[];
    asNode?: (w: Term) => SubjectNode[] | PredicateNode[];
    subjectAsNodeOnce: () => SubjectNode | null;
    objectAsNodeOnce: () => PredicateNode | null;
    sentences: () => Sentence[];
    sentence: SentenceFunc;
    groupBy: (on: Term) => GroupResult;
    next: (match: Match, context?: MatchContext) => SentenceResult;
};
export declare type WhereMatch = (sentences: Sentence[], context?: MatchContext) => boolean;
export declare type GroupResult = {
    sentences: () => Sentence[];
    having: (match: WhereMatch, context?: MatchContext) => GroupResult;
    asNode: () => SubjectNode[];
    degroup: () => SentenceResult;
};
export declare type UpdateFuc = (u: Sentence) => void;
export declare type Database = {
    sentences: Sentence[];
    date: number;
};
export declare type NodeProps = {
    update: UpdateFuc;
    find: Find;
    node: (s?: string) => SubjectNode;
    addWatcher: (w: Watcher) => void;
    reset: (newDb: Database) => void;
};
export declare enum CountOps {
    equals = "=",
    greaterThan = ">",
    greaterThanOrEqual = ">=",
    lessThan = "<",
    lessThanOrEqual = "<="
}
export declare type Compare = '>' | '<' | '=' | '<=' | '>=';
export declare type MatchContext = {
    sentences: {
        [name: string]: Sentence[];
    };
};
export declare type Watcher = (s: Sentence) => void;
export declare type MatchFuncSimple = (s: Sentence) => boolean;
export declare type MatchFunc = (s: Sentence, matchContext?: MatchContext) => boolean;
export declare type MatchWithMeta = MatchFunc & {
    and: (m: Match) => MatchFunc;
    or: (m: Match) => MatchFunc;
    simple: MatchFuncSimple;
};
export declare type Match = MatchFunc | MatchWithMeta;
