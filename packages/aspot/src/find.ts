import { flatten, flow } from 'lodash';
import { and, defaultMatchContext, isTrue, objectExists } from "./match";
import { GroupSentences, Match, MatchContext, Sentence, SentenceResult, SubjectNode, Term, WhereMatch } from "./types";

export type GroupSentencesGen = (sentences:Sentence[]) => (part:Term) => GroupSentences; 
// @TODO: test
const baseFindSentences = (from:Sentence[]) => (match:Match=isTrue, context:MatchContext=defaultMatchContext()) => (
  from.filter(s => match(s, context))
)
const findSentences = (from:Sentence[]) => (match:Match=isTrue, context:MatchContext=defaultMatchContext()) => (
  baseFindSentences(from)(and(objectExists, match), context)
); 
const baseFind = ({findSentences, result}) =>(from:Sentence[]) => (match?:Match, context?:MatchContext) => result(findSentences(from)(match, context))

const groupSentences = (sentences:Sentence[]) => (part:Term) =>{
  return sentences.reduce((result, sentence) => {
    const groupValue = sentence[part];
    if(groupValue && !result[groupValue]) result[groupValue] = [];
    if(groupValue) result[groupValue].push(sentence);
    return result;
  }, {} as GroupSentences)
}

const whereGroupSentences = (result:GroupSentences) => (match:WhereMatch,context?:MatchContext )=> {
  return Object.keys(result).reduce((r, key) => {
    const s = result[key];
    if (match(s, context)) {
      r[key] = result[key];
    }
    return r;
  }, {} as GroupSentences)
}
const groupToSentences = (group:GroupSentences) => flatten(Object.values(group));

const combineContext = (...contexts:(MatchContext | undefined)[]) => (
  contexts.reduce((result:MatchContext, context) => {
    return context ? {...result, ...context, sentences: { ...result.sentences, ...context.sentences}} : result;
  }, defaultMatchContext())
);
const addSentencesToContext = (name:string) => (sentences:Sentence[]) => (context:MatchContext) => (
  {
    ...context,
    sentences:{
      ...context.sentences,
      [name]: sentences,
    }
  }
);


export {
  findSentences,
  baseFindSentences,
  groupSentences,
  addSentencesToContext,
  whereGroupSentences,
  groupToSentences,
}