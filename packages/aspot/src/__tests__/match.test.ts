// 'use strict';
import {
  isTrue,
  isFalse,
  not, 
  and, 
  or, 
  has,
  join, 
  // join, basicWhere
} from "../match"
import { Context, emptyContext, TermType} from '../basicStoreNode';

const sampleSentence = {subject:'Joe', predicate:'boss', object:'Sally', date:0} 
describe('isTrue', () => {
	it('always returns true', () => {
	  expect(isTrue(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();

	});
});
describe('isFalse', () => {
	it('always returns true', () => {
	  expect(isFalse(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();
	});
});
describe('not', () => {
	it('always reverse what would be return by its paramater', () => {
	expect(not(isFalse)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	expect(not(isTrue)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();

	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch1 = jest.fn((s) => true);
    const mockMatch = jest.fn((c) => mockMatch1);
    const mockContext = new Map([['a', {sentences: () => [], match:isFalse}]])
    not(mockMatch)(mockContext)( {subject:'Joe', predicate:'boss', object:'Sally', date:0});
    expect(mockMatch.mock.calls[0][0]).toBe(mockContext);
    expect(mockMatch1.mock.calls[0][0]).toStrictEqual({subject:'Joe', predicate:'boss', object:'Sally', date:0});
  });
});
describe('and', () => {
	it('should return false if any Match params return false', () => {
	  expect(and(isFalse, isTrue, isTrue)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();
	});
	it('should return if all Match params return true', () => {
	  expect(and(isTrue, isTrue, isTrue)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch1 = jest.fn((s) => true);
    const mockMatch = jest.fn((c) => mockMatch1);
    const mockContext = new Map([['a', {sentences: () => [], match:isFalse}]])
    and(mockMatch)(mockContext)({subject:'Joe', predicate:'boss', object:'Sally', date:0});
    expect(mockMatch.mock.calls[0][0]).toBe(mockContext);
    expect(mockMatch1.mock.calls[0][0]).toStrictEqual({subject:'Joe', predicate:'boss', object:'Sally', date:0});
  });
});
describe('or', () => {
	it('should return True if any Match params return true', () => {
	  expect(or(isFalse, isFalse, isTrue)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeTruthy();
	});
	it('should return false if all Match params return false', () => {
	  expect(or(isFalse, isFalse, isFalse)(emptyContext())({subject:'s', predicate:'p', object:'o', date:0})).toBeFalsy();
	});
  it('shoud pass the sentence and context to each parameter', () => {
    const mockMatch1 = jest.fn((s) => true);
    const mockMatch = jest.fn((c) => mockMatch1);
    const mockContext = new Map([['a', {sentences: () => [], match:isFalse}]])
    or(mockMatch)(mockContext)({subject:'Joe', predicate:'boss', object:'Sally', date:0});
    expect(mockMatch.mock.calls[0][0]).toBe(mockContext);
    expect(mockMatch1.mock.calls[0][0]).toStrictEqual({subject:'Joe', predicate:'boss', object:'Sally', date:0});
  });
});
describe('has', () => {
	it('returns true if the part matches the value', () => {
	  expect(has(TermType.object)(sampleSentence.object)(emptyContext())(sampleSentence)).toBeTruthy();
	  expect(has(TermType.subject)(sampleSentence.subject)(emptyContext())(sampleSentence)).toBeTruthy();
	  expect(has(TermType.predicate)(sampleSentence.predicate)(emptyContext())(sampleSentence)).toBeTruthy();
	});
	it('returns false if the part does not match the value', () => {
	  expect(has(TermType.object)('dsgbhjadfb;ahbh;fh')(emptyContext())(sampleSentence)).toBeFalsy();
	  expect(has(TermType.subject)('dsgbhjadfb;ahbh;fh')(emptyContext())(sampleSentence)).toBeFalsy();
	  expect(has(TermType.predicate)('dsgbhjadfb;ahbh;fh')(emptyContext())(sampleSentence)).toBeFalsy();
	});
  it('returns true if the part matches the regex value', () => {
	  expect(has(TermType.object)(/.*/)(emptyContext())(sampleSentence)).toBeTruthy();
	  expect(has(TermType.subject)(/.*/)(emptyContext())(sampleSentence)).toBeTruthy();
	  expect(has(TermType.predicate)(/.*/)(emptyContext())(sampleSentence)).toBeTruthy();
	});
  it('returns false if the part does not matches the regex value', () => {
	  expect(has(TermType.object)(/.*ffdgabfabafgndjsj/)(emptyContext())(sampleSentence)).toBeFalsy();
	  expect(has(TermType.subject)(/.*ffdgabfabafgndjsj/)(emptyContext())(sampleSentence)).toBeFalsy();
	  expect(has(TermType.predicate)(/.*ffdgabfabafgndjsj/)(emptyContext())(sampleSentence)).toBeFalsy();
	});
});
describe('join', () => {
  const trueContext = {sentences:() => [{subject:'s', predicate:'p', object:'bob', date:0}], match:isTrue};
  const context = new Map() as Context;
  context.set('prev', trueContext);
	it('returns true when a member of the resultNames sentences (from the context) match the approrate Term in the Sentence', () => {
  	expect(join('prev')(TermType.object)(TermType.subject)(context)({subject:'bob', predicate:'friend', object:'sally', date:0})).toBeTruthy();
	});
	it('returns ture when there is no context matching the resultName', () => {
  	expect(join('differentOne')(TermType.object)(TermType.subject)(context)({subject:'bob', predicate:'friend', object:'sally', date:0})).toBeTruthy();
	});
	it('returns false when no member of the resultName sentences (from the context) match teh approrate Term', () => {
	  expect(join('prev')(TermType.object)(TermType.subject)(context)({subject:'joe', predicate:'friend', object:'sally', date:0})).toBeFalsy();
  });
});
// describe('basicWhere', () => {
// 	it('match property should return its part value passed in the is function', () => {
// 		const is = jest.fn((a) => (b) => isTrue)
// 		const join0= jest.fn(part => isTrue)
// 		const join1= jest.fn(prevPart => join0)
// 		const join =  jest.fn(search => join1)
//     basicWhere({ is, join })(TermType.subject).match;
// 		expect(is.mock.calls[0][0]).toBe(TermType.subject);
// 	});
// 	it('matchWith Should call join function with approrate values', () => {
// 		const is = jest.fn((a) => (b) => isTrue)
// 		const join0= jest.fn(part => isTrue)
// 		const join1= jest.fn(prevPart => join0)
// 		const join =  jest.fn(search => join1)
//     basicWhere({ is, join })(TermType.subject).matchPrev(TermType.object);
// 		expect(join0.mock.calls[0][0]).toBe(TermType.subject)
// 		expect(join1.mock.calls[0][0]).toBe(TermType.object)
// 		expect(join.mock.calls[0][0]).toBe('prev')
// 	});
// 	it('matchWith Should call join function with approrate values', () => {
// 		const is = jest.fn((a) => (b) => isTrue)
// 		const join0= jest.fn(part => isTrue)
// 		const join1= jest.fn(prevPart => join0)
// 		const join =  jest.fn(search => join1)
//     basicWhere({ is, join })(TermType.subject).matchWith('search')(TermType.object);
// 		expect(join0.mock.calls[0][0]).toBe(TermType.subject)
// 		expect(join1.mock.calls[0][0]).toBe(TermType.object)
// 		expect(join.mock.calls[0][0]).toBe('search')
// 	});
// });