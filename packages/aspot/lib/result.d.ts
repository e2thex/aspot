import { GroupSentences, Match, MatchContext, Sentence, Term, WhereMatch } from "./types";
export declare type SentencesBasicResult = {
    sentences: () => Sentence[];
};
export declare type ContextResult = {
    context: () => MatchContext;
};
declare type SentenceResult = {
    sentence: () => Sentence | null;
};
export declare type SubjectAsNodesResult<S> = {
    subjectAsNodes: () => S[];
};
declare type ObjectAsNodesResult<P> = {
    objectAsNodes: () => P[];
};
declare type ObjectAsNodeResult<P> = {
    objectAsNode: () => P | null;
};
declare type SubjectAsNodeResult<S> = {
    subjectAsNode: () => S | null;
};
declare type NextAsResult<R> = {
    nextAs: (name: string) => (match: Match) => R;
};
declare type NextResult<R> = {
    nextAs: (match: Match) => R;
};
declare type GroupByResult<G> = {
    groupBy: (part: Term) => G;
};
declare type PartResult = {
    part: () => Term;
};
declare type SubjectNodeGen<S> = (s: string) => S;
declare type PredicateNodeGen<P> = (subject: string) => (predicate: string) => P;
declare type Find<R> = (match: Match, context?: MatchContext) => R;
export declare type GroupGen<G> = (part: Term) => (sentences: Sentence[], Context?: MatchContext) => G;
export declare type GroupedSentencesGen = (part: Term) => (sentences: Sentence[], Context?: MatchContext) => GroupSentences;
declare type SentenceResultProps<P, S, R, G> = {
    predicateNode: PredicateNodeGen<P>;
    subjectNode: SubjectNodeGen<S>;
    find: Find<R>;
    group: GroupGen<G>;
};
declare const sentencesBasicResult: (sentences: Sentence[]) => <A extends {}>(result: A) => A & {
    sentences: () => Sentence[];
};
declare const addSentenceResult: <A extends SentencesBasicResult>(result: A) => A & {
    sentence: () => Sentence;
};
declare const addSubjectAsNodesResult: <S, A extends SentencesBasicResult>(subjectNode: SubjectNodeGen<S>) => (result: A & SentencesBasicResult) => A & {
    subjectAsNodes: () => S[];
    sentences: () => Sentence[];
};
declare const addObjectAsNodesResult: <P, A extends SentencesBasicResult>(predicateNode: PredicateNodeGen<P>) => (result: A) => A & {
    objectAsNodes: () => P[];
};
declare const addObjectAsNodeResult: <P, A extends ObjectAsNodesResult<P>>(result: A) => A & {
    objectAsNode: () => P;
};
declare const addSubjectAsNodeResult: <S, A extends SubjectAsNodesResult<S>>(result: A) => A & {
    subjectAsNode: () => S;
};
declare const addContextResult: (context?: MatchContext) => <A extends {}>(result: A) => A & {
    context: () => MatchContext;
};
declare const addNextAsResult: <R>(find: Find<R>) => <A extends SentencesBasicResult & ContextResult>(result: A) => A & {
    nextAs: (name: string) => (match: Match) => R;
};
declare const addGroupByResult: <G>(group: GroupGen<G>) => <A extends SentencesBasicResult & ContextResult>(result: A) => A & {
    groupBy: (part: Term) => G;
};
declare type SentencesResult<P, S, R, G> = SentencesBasicResult & ContextResult & SentenceResult & SubjectAsNodesResult<S> & SubjectAsNodeResult<S> & ObjectAsNodesResult<P> & ObjectAsNodeResult<P> & NextAsResult<R> & NextResult<R> & GroupByResult<G>;
declare const sentencesResult: <P, S, R, G>(props: SentenceResultProps<P, S, R, G>) => (sentences: Sentence[], context?: MatchContext) => SentencesResult<P, S, R, G>;
declare const addPartResult: (part: Term) => <A extends {}>(result: A) => A & {
    part: () => Term;
};
declare type SentencesResultGen<R> = (sentences: Sentence[], context?: MatchContext) => R;
declare type GroupedSentencesResult = {
    groupedSentences: () => GroupSentences;
};
declare const addGroupedSentencesResult: (groupSentences: GroupedSentencesGen) => <A extends SentencesBasicResult & ContextResult & PartResult>(result: A) => A & {
    groupedSentences: () => GroupSentences;
};
declare const addDegroupResult: <R>(sentencesResult: SentencesResultGen<R>) => <A extends SentencesBasicResult & ContextResult>(result: A) => A & {
    degroup: () => R;
};
declare const renameToAsNodes: <S, A extends SubjectAsNodesResult<S>>(result: A) => Omit<A, "subjectAsNodes"> & {
    asNode: () => S[];
};
export declare type WhereGroupSentences = (result: GroupSentences) => (match: WhereMatch, context?: MatchContext) => GroupSentences;
declare type AddHavingResultProps<G> = {
    groupToSentences: (g: GroupSentences) => Sentence[];
    groupResult: GroupGen<G>;
    whereGroupSentences: WhereGroupSentences;
};
declare const addHavingResult: <G, A extends GroupedSentencesResult & ContextResult & PartResult>(props: AddHavingResultProps<G>) => (result: A) => A & {
    having: (match: WhereMatch) => G;
};
export { sentencesResult, addObjectAsNodeResult, addObjectAsNodesResult, addSubjectAsNodeResult, addSubjectAsNodesResult, addSentenceResult, addContextResult, sentencesBasicResult, addNextAsResult, addGroupByResult, addGroupedSentencesResult, addDegroupResult, renameToAsNodes, addPartResult, addHavingResult, };
