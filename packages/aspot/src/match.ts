import {MatchContext, MatchFunc, MatchWithMeta, Sentence, Term, TermType } from "./depricated/types";
import { Match } from './basicStoreNode';
import { match } from "assert";

const defaultMatchContext = () => ({sentences:{}} as MatchContext);
const isTrue:Match = (context) =>(sentence) => true;
const isFalse:Match = (context) =>(sentence) => false;

const not= (clause:Match):Match => (context) =>  (sentence) => !clause(context)(sentence);
const and = (...clauses:Match[]):Match => (context) => (sentence:Sentence) => (
  clauses.reduce((result, clause) => result && clause(context)(sentence) ,true)
);
const or = (...clauses:Match[]):Match => (context) => (sentence:Sentence) => (
  clauses.reduce((result, clause) => result || clause(context)(sentence) ,false)
);
const has = (part:Term) => (v:string|RegExp):Match => (context) => (sentence:Sentence) => {
  const regExOrCompare = (test:string|RegExp) => (val:string) => (
    (test instanceof RegExp) 
      ? (val.match(test) ? true : false)
      : val === test
  ); 
  const compare = sentence[part]
  if (!compare) return false;
  return regExOrCompare(v)(compare);
}; 

const join = (resultName:string) => (prev:Term) =>(next:Term):Match => (context) =>  (sentence) => {
    return context.has(resultName)  ? context.get(resultName).sentences().map(s => s[prev]).includes(sentence[next]) : true;
  } ;
const objectExists = (sentence:Sentence) => sentence.object !==null;
// const addMatchMeta = (match:MatchFunc):MatchWithMeta => {
//   return Object.assign(
//     match,
//     {
//         or: (nextMatch:Match) => or(match, nextMatch),
//         and: (nextMatch:Match) => and(match, nextMatch),
//         simple: (sentence:Sentence) => match(sentence),
//     }
//   )
// }


// type WhereObject = {
//  match: (part:Term) => Match,
//  matchPrev: (prevPart:Term) => Match,
//  matchWith: (search:string) => (prevPart:Term) => Match
// }
// type Where =(part:Term, search:string|regex|
// const basicWhere = (props) => (part:Term) => {
//   const { has, join } = props;
//   return {
//     match: has(part),
//     matchPrev: (prevPart:Term) => join('prev')(prevPart)(part),
//     matchWith: (search:string) => (prevPart:Term) => join(search)(prevPart)(part),
//   } as WhereObject
// }
// const where = basicWhere({has, join});



// BELOW THIS ARE NOT TESTED
const joinPrev = join('prev');
const subjectIs = (subject:string|RegExp):Match => has(TermType.subject)(subject);
const predicateIs = (predicate:string|RegExp):Match => has(TermType.predicate)(predicate); 
const objectIs = (object:string|RegExp):Match => has(TermType.object)(object);
const matchPartial = (search:Partial<Sentence>) => and(...Object.keys(search).map(s => has(s as Term)(search[s])))
export {
	isTrue,
	isFalse,
	not,
  and,
  or,
  has,
   subjectIs,
   predicateIs,
   objectIs,
  join,
  joinPrev,
  // matchPartial,
  objectExists,
  defaultMatchContext,
  // basicWhere,
  // where,
}