'use strict';
import { exportAllDeclaration } from "@babel/types";
import { SearchSource } from "@jest/core";
import { isTrue, isFalse, not, and, or, is, join, basicWhere } from "../lib/match"
import { Term, TermType } from "../lib/types";


const sampleSentence = {subject:'Joe', predicate:'boss', object:'Sally', date:0} 
const sampleContext = {sentences:{}}; 
describe('isTrue', () => {
	it('always returns true', () => {
	expect(isTrue({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();

	});
});
describe('isFalse', () => {
	it('always returns true', () => {
	expect(isFalse({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();

	});
});
describe('not', () => {
	it('always reverse what would be return by its paramater', () => {
	expect(not(isFalse)({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	expect(not(isTrue)({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();

	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch = jest.fn(isTrue);
    and(mockMatch)(sampleSentence, sampleContext);
    expect(mockMatch.mock.calls[0][0]).toBe(sampleSentence);
    expect(mockMatch.mock.calls[0][1]).toBe(sampleContext);
  });
});
describe('and', () => {
	it('should return false if any Match params return false', () => {
	  expect(and(isFalse, isTrue, isTrue)({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();
	});
	it('should return if all Match params return true', () => {
	  expect(and(isTrue, isTrue, isTrue)({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch = jest.fn(isTrue);
    and(mockMatch)(sampleSentence, sampleContext);
    expect(mockMatch.mock.calls[0][0]).toBe(sampleSentence);
    expect(mockMatch.mock.calls[0][1]).toBe(sampleContext);
  });
});
describe('or', () => {
	it('should return True if any Match params return true', () => {
	  expect(or(isFalse, isFalse, isTrue)({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	});
	it('should return false if all Match params return false', () => {
	  expect(or(isFalse, isFalse, isFalse)({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();
	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch = jest.fn(isTrue);
    or(mockMatch)(sampleSentence, sampleContext);
    expect(mockMatch.mock.calls[0][0]).toBe(sampleSentence);
    expect(mockMatch.mock.calls[0][1]).toBe(sampleContext);
  });
});
describe('is', () => {
	it('returns true if the part matches the value', () => {
	  expect(is(TermType.object)(sampleSentence.object)(sampleSentence)).toBeTruthy();
	  expect(is(TermType.subject)(sampleSentence.subject)(sampleSentence)).toBeTruthy();
	  expect(is(TermType.predicate)(sampleSentence.predicate)(sampleSentence)).toBeTruthy();
	});
	it('returns false if the part does not match the value', () => {
	  expect(is(TermType.object)('dsgbhjadfb;ahbh;fh')(sampleSentence)).toBeFalsy();
	  expect(is(TermType.subject)('dsgbhjadfb;ahbh;fh')(sampleSentence)).toBeFalsy();
	  expect(is(TermType.predicate)('dsgbhjadfb;ahbh;fh')(sampleSentence)).toBeFalsy();
	});
  it('returns true if the part matches the regex value', () => {
	  expect(is(TermType.object)(/.*/)(sampleSentence)).toBeTruthy();
	  expect(is(TermType.subject)(/.*/)(sampleSentence)).toBeTruthy();
	  expect(is(TermType.predicate)(/.*/)(sampleSentence)).toBeTruthy();
	});
  it('returns false if the part does not matches the regex value', () => {
	  expect(is(TermType.object)(/.*ffdgabfabafgndjsj/)(sampleSentence)).toBeFalsy();
	  expect(is(TermType.subject)(/.*ffdgabfabafgndjsj/)(sampleSentence)).toBeFalsy();
	  expect(is(TermType.predicate)(/.*ffdgabfabafgndjsj/)(sampleSentence)).toBeFalsy();
	});
});
describe('join', () => {
	it('returns true when a member of the resultNames sentences (from the context) match the approrate Term in the Sentence', () => {
    const trueContext = {sentences:{'prev':[{subject:'s', predicate:'p', object:'bob', date:0}]}};
  	expect(join('prev')(TermType.object)(TermType.subject)({subject:'bob', predicate:'friend', object:'sally', date:0}, trueContext)).toBeTruthy();
	});
	it('returns false when there is no context matching the resultName', () => {
    const trueContext = {sentences:{'prev':[{subject:'s', predicate:'p', object:'bob', date:0}]}};
  	expect(join('differentOne')(TermType.object)(TermType.subject)({subject:'bob', predicate:'friend', object:'sally', date:0}, trueContext)).toBeFalsy();
	});
	it('returns false when no member of the resultName sentences (from the context) match teh approrate Term', () => {
    const trueContext = {sentences:{'prev':[{subject:'s', predicate:'p', object:'dan', date:0}]}};
	  expect(join('prev')(TermType.object)(TermType.subject)({subject:'bob', predicate:'friend', object:'sally', date:0}, trueContext)).toBeFalsy();
  });
});
describe('basicWhere', () => {
	it('match property should return its part value passed in the is function', () => {
		const is = jest.fn((a) => (b) => isTrue)
		const join0= jest.fn(part => isTrue)
		const join1= jest.fn(prevPart => join0)
		const join =  jest.fn(search => join1)
    basicWhere({ is, join })(TermType.subject).match;
		expect(is.mock.calls[0][0]).toBe(TermType.subject);
	});
	it('matchWith Should call join function with approrate values', () => {
		const is = jest.fn((a) => (b) => isTrue)
		const join0= jest.fn(part => isTrue)
		const join1= jest.fn(prevPart => join0)
		const join =  jest.fn(search => join1)
    basicWhere({ is, join })(TermType.subject).matchPrev(TermType.object);
		expect(join0.mock.calls[0][0]).toBe(TermType.subject)
		expect(join1.mock.calls[0][0]).toBe(TermType.object)
		expect(join.mock.calls[0][0]).toBe('prev')
	});
	it('matchWith Should call join function with approrate values', () => {
		const is = jest.fn((a) => (b) => isTrue)
		const join0= jest.fn(part => isTrue)
		const join1= jest.fn(prevPart => join0)
		const join =  jest.fn(search => join1)
    basicWhere({ is, join })(TermType.subject).matchWith('search')(TermType.object);
		expect(join0.mock.calls[0][0]).toBe(TermType.subject)
		expect(join1.mock.calls[0][0]).toBe(TermType.object)
		expect(join.mock.calls[0][0]).toBe('search')
	});
});