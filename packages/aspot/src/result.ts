import { group } from "console";
import { flow, result } from "lodash";
import { addSentencesToContext, groupSentences, whereGroupSentences, groupToSentences } from "./find";
import { defaultMatchContext, matchPartial } from "./match";
import { GroupSentences, Match, MatchContext, PredicateNode, Sentence, SubjectNode, Term, WhereMatch } from "./types";

export type SentencesBasicResult = {
  sentences: () => Sentence[],
}
export type ContextResult = {
  context: () => MatchContext,
}
type SentenceResult = {
  sentence: () => Sentence | null;
};
export type SubjectAsNodesResult<S> = {
  subjectAsNodes: () => S[],
}
type ObjectAsNodesResult<P> = {
  objectAsNodes: () => P[],
}
type ObjectAsNodeResult<P> = {
  objectAsNode: () => P | null,
}
type SubjectAsNodeResult<S> = {
  subjectAsNode: () => S | null,
}
type NextAsResult<R> = {
  nextAs: (name:string) => (match:Match) => R
}
type NextResult<R> = {
  nextAs: (match:Match) => R
}
type GroupByResult<G> = {
  groupBy: (part:Term) => G
}
type PartResult = {
  part: () => Term;
}
type WhereResult<G> = {
  where: (m:WhereMatch) => G
}

type SubjectNodeGen<S> = (s:string) => S;
type PredicateNodeGen<P> = (subject:string)  => (predicate:string)=> P;
type Find<R> = (match:Match, context?:MatchContext) => R
export type GroupGen<G> = (part:Term) => (sentences:Sentence[], Context?:MatchContext) => G;
export type GroupedSentencesGen = (part:Term) => (sentences:Sentence[], Context?:MatchContext) => GroupSentences;
type SentenceResultProps<P, S, R, G> = {
  predicateNode: PredicateNodeGen<P>,
  subjectNode: SubjectNodeGen<S>,
  find: Find<R>,
  group: GroupGen<G>,
}
type GroupResultProps<R, S, G> = {
  subjectNode: SubjectNodeGen<S>,
  sentenceResult: SentencesResultGen<R>,
  groupSentences: GroupedSentencesGen,
  group: GroupGen<G>,
  
}
const sentencesBasicResult = (sentences:Sentence[]) => <A extends {}> (result:A) => ({
  ...result,
  sentences: () => sentences,
})
const addSentenceResult =<A extends SentencesBasicResult> (result:A) => ({
  ...result,
  sentence: () => result.sentences()[0] || null,
});
const addSubjectAsNodesResult =<S, A extends SentencesBasicResult> (subjectNode:SubjectNodeGen<S>) => (result:A & SentencesBasicResult) => ({
  ...result,
  subjectAsNodes: () => [...new Set(
        result.sentences()
        .map(s => s.subject)
      )]
      .map(s => subjectNode(s))
})
const addObjectAsNodesResult =<P, A extends SentencesBasicResult> (predicateNode:PredicateNodeGen<P>) => (result:A) => ({
  ...result,
  objectAsNodes: () => result.sentences().map(s => predicateNode(s.subject)(s.predicate))
})
const addObjectAsNodeResult =<P, A extends ObjectAsNodesResult<P>> (result:A)=> ({
  ...result,
  objectAsNode: () => result.objectAsNodes()[0] || null,
})
const addSubjectAsNodeResult =<S, A extends SubjectAsNodesResult<S>> (result:A) => ({
  ...result,
  subjectAsNode: () => result.subjectAsNodes()[0] || null,
})
const addContextResult = (context?:MatchContext) =><A extends {}> (result:A) => ({
  ...result,
  context: () => context || defaultMatchContext(),
});
const addNextAsResult = <R> (find:Find<R>) => <A extends SentencesBasicResult & ContextResult > (result:A) => ({
  ...result,
  nextAs: (name:string) => (match:Match) => (
    find(
      match, 
      addSentencesToContext(name)(result.sentences())(result.context())
    )
  )
}) 
const addNextResult = <R, A extends NextAsResult<R>> (result:A) => ({
  ...result,
  next: result.nextAs('prev')
})
const addGroupByResult =<G> (group: GroupGen<G>) => <A extends SentencesBasicResult & ContextResult> (result:A) => ({
  ...result,
  groupBy: (part:Term) => group(part)(result.sentences(), result.context())
});
type SentencesResult<P, S, R, G> =
  SentencesBasicResult
  & ContextResult
  & SentenceResult
  & SubjectAsNodesResult<S>
  & SubjectAsNodeResult<S>
  & ObjectAsNodesResult<P>
  & ObjectAsNodeResult<P>
  & NextAsResult<R>
  & NextResult<R>
  & GroupByResult<G>
;
const sentencesResult =<P,S, R, G> (props:SentenceResultProps<P, S, R, G>) => (sentences:Sentence[], context?:MatchContext):SentencesResult<P,S, R, G> =>flow(
  addNextResult,
  addNextAsResult(props.find),
  addSubjectAsNodeResult,
  addSubjectAsNodesResult(props.subjectNode),
  addObjectAsNodeResult,
  addObjectAsNodesResult(props.predicateNode),
  addSentenceResult,
  addContextResult(context),
  sentencesBasicResult(sentences),
)({});
const addPartResult = (part:Term) => <A extends {}> (result:A) => ({
  ...result,
  part: () => part,
})
type SentencesResultGen<R> = (sentences:Sentence[], context?:MatchContext) => R;
type GroupedSentencesResult = {
  groupedSentences: () => GroupSentences;
}
const addGroupedSentencesResult = (groupSentences:GroupedSentencesGen) => <A extends SentencesBasicResult & ContextResult & PartResult> (result:A) =>({
  ...result,
  groupedSentences: () => groupSentences(result.part())(result.sentences(), result.context())
})
const addDegroupResult =<R> (sentencesResult:SentencesResultGen<R>)=> <A extends SentencesBasicResult & ContextResult> (result:A) =>({
  ...result,
  degroup: () => sentencesResult(result.sentences(), result.context())
})

const renameToAsNodes =<S, A extends SubjectAsNodesResult<S>> (result:A) => {
  const { subjectAsNodes, ...rest } = result;
  return {
    ...rest,
    asNode: subjectAsNodes,
  }
};
const addAsNodesResult = <S, A extends SentencesBasicResult> (subjectNode:SubjectNodeGen<S>) => (result:A & SentencesBasicResult)  => flow(
  renameToAsNodes,
  addSubjectAsNodesResult(subjectNode)
)(result)

export type WhereGroupSentences = (result:GroupSentences) => (match:WhereMatch,context?:MatchContext ) => GroupSentences;
type AddHavingResultProps<G> = {
  groupToSentences:(g:GroupSentences) => Sentence[], 
  groupResult:GroupGen<G>,
  whereGroupSentences:WhereGroupSentences,
}
const addHavingResult = <G, A extends GroupedSentencesResult & ContextResult & PartResult> (props:AddHavingResultProps<G>) => (result:A) => {
  const { groupResult, groupToSentences, whereGroupSentences } = props;
  const { context, part, groupedSentences } = result;
  return {
    ...result,
    having: (match:WhereMatch) => (
      groupResult(result.part())(
        groupToSentences(whereGroupSentences(groupedSentences())(match, context())),
        context(),
      )
    )
  }
}

const groupResult =<G, R, S> (props:GroupResultProps<R, S, G>) => (sentences:Sentence[], context?:MatchContext) => (part:Term) => flow(
  sentencesBasicResult(sentences),
  addContextResult(context),
  addPartResult(part),
  addGroupedSentencesResult(props.groupSentences),
  addAsNodesResult(props.subjectNode),
  addDegroupResult(props.sentenceResult),
  addHavingResult({whereGroupSentences, groupToSentences,groupResult:props.group })
)({})
export {
  sentencesResult,
  addObjectAsNodeResult,
  addObjectAsNodesResult,
  addSubjectAsNodeResult,
  addSubjectAsNodesResult,
  addSentenceResult,
  addContextResult,
  sentencesBasicResult,
  addNextAsResult,
  addGroupByResult,
  addGroupedSentencesResult,
  addDegroupResult,
  renameToAsNodes,
  addPartResult,
  addHavingResult,
}
