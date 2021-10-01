/*
import { flow} from "lodash";
import { addSentencesToContext } from "./find";
import { defaultMatchContext } from "./match";
import { GroupSentences, Match, MatchContext, Sentence, Term, WhereMatch } from "./types";

export type SentencesResult<P, S, R, G> = {
  sentences: () => Sentence[],
  context: () => MatchContext,
  subjectAsNodes: () => S[],
  objectAsNodes: () => P[],
  objectAsNode: () => P | null,
  subjectAsNode: () => S | null,
  nextAs: (name:string) => (match:Match) => R
  next: (match:Match) => R
  groupBy: (part:Term) => G
}
export type SentencesBasicResult = {
  sentences: () => Sentence[],

}
export type ContextResult = {
  context: () => MatchContext,
}
export type SentenceResult = {
  sentence: () => Sentence | null;
};
export type SubjectAsNodesResult<S> = {
  subjectAsNodes: () => S[],
}
export type ObjectAsNodesResult<P> = {
  objectAsNodes: () => P[],
}
export type ObjectAsNodeResult<P> = {
  objectAsNode: () => P | null,
}
export type SubjectAsNodeResult<S> = {
  subjectAsNode: () => S | null,
}
export type NextAsResult<R> = {
  nextAs: (name:string) => (match:Match) => R
}
export type NextResult<R> = {
  next: (match:Match) => R
}
export type GroupByResult<G> = {
  groupBy: (part:Term) => G
}
export type PartResult = {
  part: () => Term;
}
export type WhereResult<G> = {
  where: (m:WhereMatch) => G
}
export type DegroupResult<R> = {
  degroup: () => R
}
export type AsNodesResult<S> = {
  asNodes: () => S[]
}
export type HavingResult<G> = {
  having: (m:WhereMatch) => G
}

export type SubjectNodeGen<S> = (s:string) => S;
export type PredicateNodeGen<P> = (subject:string)  => (predicate:string)=> P;
export type Find<R> = (match:Match, context?:MatchContext) => R
export type GroupResultGen<G> = (part:Term) => (sentences:Sentence[], Context?:MatchContext) => G;
export type GroupedSentencesGen = (part:Term) => (sentences:Sentence[]) => GroupSentences;
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
const addGroupByResult =<G> (group: GroupResultGen<G>) => <A extends SentencesBasicResult & ContextResult> (result:A) => ({
  ...result,
  groupBy: (part:Term) => group(part)(result.sentences(), result.context())
});

const addPartResult = (part:Term) => <A extends {}> (result:A) => ({
  ...result,
  part: () => part,
})
export type SentencesResultGen<R> = (sentences:Sentence[], context?:MatchContext) => R;
export type GroupedSentencesResult = {
  groupedSentences: () => GroupSentences;
}
const addGroupedSentencesResult = (groupSentences:GroupedSentencesGen) => <A extends SentencesBasicResult & ContextResult & PartResult> (result:A) =>({
  ...result,
  groupedSentences: () => groupSentences(result.part())(result.sentences())
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
export type AddHavingResultProps<G> = {
  groupToSentences:(g:GroupSentences) => Sentence[], 
  groupResult:GroupResultGen<G>,
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

export {
  addObjectAsNodeResult,
  addObjectAsNodesResult,
  addSubjectAsNodeResult,
  addSubjectAsNodesResult,
  addSentenceResult,
  addContextResult,
  addAsNodesResult,
  sentencesBasicResult,
  addNextAsResult,
  addGroupByResult,
  addGroupedSentencesResult,
  addDegroupResult,
  renameToAsNodes,
  addPartResult,
  addHavingResult,
}
*/