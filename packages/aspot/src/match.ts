import { Match, MatchContext, MatchFunc, MatchWithMeta, Sentence, Term, TermType } from "./types";

const defaultMatchContext = () => ({sentences:{}} as MatchContext);
const isTrue:Match = () => true;
const isFalse:Match = () => false;

const not = (clause:Match):Match =>  addMatchMeta((sentence, context) => !clause(sentence, context));
const and = (...clauses:Match[]) => addMatchMeta((sentence:Sentence, context?:MatchContext) => (
  clauses.reduce((result, clause) => result && clause(sentence, context) ,true)
));
const or = (...clauses:Match[]) => addMatchMeta((sentence:Sentence, context?:MatchContext) => (
  clauses.reduce((result, clause) => result || clause(sentence, context) ,false)
));
const regExOrCompare = (test:string|RegExp) => (val:string) => (
  (test instanceof RegExp) 
    ? (val.match(test) ? true : false)
    : val === test
); 
const is = (part:Term) => (v:string|RegExp) =>  addMatchMeta((sentence:Sentence) => {
  const compare = sentence[part]
  if (!compare) return false;
  return regExOrCompare(v)(compare);
}); 

const join = (resultName:string) => (prev:Term) =>(next:Term) => addMatchMeta(
  (sentence, context) => {
    const { sentences } = context || defaultMatchContext();
    return sentences[resultName] ? sentences[resultName].map(s => s[prev]).includes(sentence[next]) : false;
  } 
);
const objectExists = (sentence:Sentence) => sentence.object !==null;
const addMatchMeta = (match:MatchFunc):MatchWithMeta => {
  return Object.assign(
    match,
    {
        or: (nextMatch:Match) => or(match, nextMatch),
        and: (nextMatch:Match) => and(match, nextMatch),
        simple: (sentence:Sentence) => match(sentence),
    }
  )
}

const subjectIs = (subject:string|RegExp):Match => is(TermType.subject)(subject);
const predicateIs = (predicate:string|RegExp):Match => is(TermType.predicate)(predicate); 
const objectIs = (object:string|RegExp):Match => is(TermType.object)(object);
const matchPartial = (search:Partial<Sentence>) => addMatchMeta(
  and(...Object.keys(search).map(s => is(s as Term)(search[s])))
);
type WhereObject = {
  match: (part:Term) => Match,
  matchPrev: (prevPart:Term) => Match,
  matchWith: (search:string) => (prevPart:Term) => Match
}
const basicWhere = (props) => (part:Term) => {
  const { is, join } = props;
  return {
    match: is(part),
    matchPrev: (prevPart:Term) => join('prev')(prevPart)(part),
    matchWith: (search:string) => (prevPart:Term) => join(search)(prevPart)(part),
  } as WhereObject
}
const where = basicWhere({is, join});
const joinPrev = join('prev')
export {
	isTrue,
	isFalse,
	not,
  and,
  or,
  is,
  subjectIs,
  predicateIs,
  objectIs,
  join,
  joinPrev,
  matchPartial,
  objectExists,
  defaultMatchContext,
  basicWhere,
  where,
}