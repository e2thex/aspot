/*
import {
  addContextResult,
  addDegroupResult,
  addGroupedSentencesResult,
  addHavingResult,
  addPartResult,
  addAsNodesResult,
  AsNodesResult,
  ContextResult,
  DegroupResult,
  GroupedSentencesResult,
  GroupResultGen,
  HavingResult,
  PartResult,
  sentencesBasicResult,
  SentencesBasicResult,
  SentencesResultGen,
  SubjectNodeGen,
} from "./result";
import {
 whereGroupSentences,
 groupToSentences,
 groupSentences,
} from './find';
type GroupResult<R, S, G>  = 
  SentencesBasicResult
  & ContextResult
  & PartResult
  & GroupedSentencesResult 
  & AsNodesResult<S>
  & DegroupResult<R>
  & HavingResult<G>
;
type GroupResultProps<R, S, G> = {
  subjectNode: SubjectNodeGen<S>,
  sentencesResult: SentencesResultGen<R>,
  groupResult: GroupResultGen<G>,
}
const groupResult =<G, R, S> (props:GroupResultProps<R, S, G>) => (sentences:Sentence[], context?:MatchContext) => (part:Term) => flow(
  sentencesBasicResult(sentences),
  addContextResult(context),
  addPartResult(part),
  addGroupedSentencesResult(groupSentences),
  addAsNodesResult(props.subjectNode),
  addDegroupResult(props.sentencesResult),
  addHavingResult({whereGroupSentences, groupToSentences,groupResult:props.groupResult })
)({}) as GroupResult<G, R, S>;

export default groupResult;
*/