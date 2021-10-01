/*
import {flow} from 'lodash';
import {
  Find,
  ContextResult,
  GroupByResult,
  GroupResultGen,
  NextAsResult,
  NextResult,
  ObjectAsNodeResult,
  ObjectAsNodesResult,
  PredicateNodeGen,
  SentencesBasicResult,
  SubjectAsNodeResult,
  SubjectAsNodesResult,
  SubjectNodeGen,
  addNextAsResult,
  addSubjectAsNodeResult,
  addSubjectAsNodesResult,
  addObjectAsNodeResult,
  addObjectAsNodesResult,
  addSentenceResult,
  addContextResult,
  sentencesBasicResult
 } from "./result";
import { Sentence, SentenceResult } from "./types";
export type SentencesResult<P, S, R, G> =
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
export type SentenceResultProps<P, S, R, G> = {
  predicateNode: PredicateNodeGen<P>,
  subjectNode: SubjectNodeGen<S>,
  find: Find<R>,
  group: GroupResultGen<G>,
}
const sentencesResult =<P,S, R, G> (props:SentenceResultProps<P, S, R, G>) => (sentences:Sentence[], context?:MatchContext):SentencesResult<P,S, R, G> =>flow(
  addNextAsResult,
  addNextAsResult(props.find),
  addSubjectAsNodeResult,
  addSubjectAsNodesResult(props.subjectNode),
  addObjectAsNodeResult,
  addObjectAsNodesResult(props.predicateNode),
  addSentenceResult,
  addContextResult(context),
  sentencesBasicResult(sentences),
)({});
export default sentencesResult;
*/