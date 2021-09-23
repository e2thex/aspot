import { Match, MatchContext, Sentence, Term } from "./types";
export declare type SentencesBasicResult = {
    sentences: () => Sentence[];
};
export declare type ContextResult = {
    context: () => MatchContext;
};
declare type SubjectAsNodesResult<S> = {
    subjectAsNodes: () => S[];
};
declare type ObjectAsNodesResult<P> = {
    objectAsNodes: () => P[];
};
declare type SubjectNodeGen<S> = (s: string) => S;
declare type PredicateNodeGen<P> = (subject: string) => (predicate: string) => P;
declare type Find<R> = (match: Match, context?: MatchContext) => R;
declare type GroupGen<G> = (part: Term) => (sentences: Sentence[], Context?: MatchContext) => G;
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
declare const sentencesResult: <P, S, R, G>(props: SentenceResultProps<P, S, R, G>) => (sentences: Sentence[], context?: MatchContext) => any;
export default sentencesResult;
export { addObjectAsNodeResult, addObjectAsNodesResult, addSubjectAsNodeResult, addSubjectAsNodesResult, addSentenceResult, addContextResult, sentencesBasicResult, addNextAsResult, addGroupByResult, };
