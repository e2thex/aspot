// import { isExportDeclaration } from 'typescript';
// import { addSentencesToContext, baseFindSentences, groupSentences, groupToSentences, whereGroupSentences }  from '../lib/find';
// import { defaultMatchContext, isTrue, subjectIs } from '../match';
// import { MatchContext, Sentence, TermType } from '../types';
// describe('findSentences', () => {
// 	it('should pass each sentence and the context to the match for each sentence', () => {
//     const mockMatch = jest.fn(isTrue);
//     const c = defaultMatchContext();
//     baseFindSentences([
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'d', predicate:'e', object:'f', date:0}
//     ])(mockMatch, c);
//     expect(mockMatch.mock.calls[0][0]).toStrictEqual({subject:'a', predicate:'b', object:'c', date:0})
//     expect(mockMatch.mock.calls[0][1]).toStrictEqual(c)
//     expect(mockMatch.mock.calls[1][0]).toStrictEqual({subject:'d', predicate:'e', object:'f', date:0})
//     expect(mockMatch.mock.calls[1][1]).toStrictEqual(c)
// 	});
//   it('should return a filter list for all sentence that receive a true from the match', () =>{
//     const c = defaultMatchContext();
//     expect(baseFindSentences([
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'d', predicate:'e', object:'f', date:0}
//     ])(subjectIs('a'), c)
//     ).toStrictEqual([{subject:'a', predicate:'b', object:'c', date:0}])
//   })
// });
// describe('groupSentences', () => {
// 	it('create a GroupSentences object based on the part of the sentences', () => {
//     const sentences = [
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'d', predicate:'e', object:'f', date:0},
//       {subject:'a', predicate:'bx', object:'cx', date:0},
//       {subject:'d', predicate:'ey', object:'fy', date:0}
//     ];
//     expect(groupSentences(TermType.subject)(sentences)).toStrictEqual({
//       a:[
//         {subject:'a', predicate:'b', object:'c', date:0},
//         {subject:'a', predicate:'bx', object:'cx', date:0},
//       ],
//       d:[
//         {subject:'d', predicate:'e', object:'f', date:0},
//         {subject:'d', predicate:'ey', object:'fy', date:0}
//       ]
//     })
//   });
// });
// describe('addSentencesToContext', () => {
// 	it('should return a context match in incomeing one expect have the new sentences added', () => {
//     const context = defaultMatchContext();
//     const sentences = [
//       {subject:'d', predicate:'e', object:'f', date:0},
//       {subject:'d', predicate:'ey', object:'fy', date:0}
//     ]
//     expect(addSentencesToContext('prev')(sentences)(context).sentences.prev).toStrictEqual(
//       [
//         {subject:'d', predicate:'e', object:'f', date:0},
//         {subject:'d', predicate:'ey', object:'fy', date:0}
//       ]
//     )
//   });
// });
// describe('whereGroupSentences', () => {
//   const groupSentences = {
//     a:[
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'a', predicate:'bx', object:'cx', date:0},
//     ],
//     d:[
//       {subject:'d', predicate:'e', object:'f', date:0},
//       {subject:'d', predicate:'ey', object:'fy', date:0}
//     ]
//   }
// 	it('should pass each group to provide match with the context', () => {
//     const match = jest.fn((s:Sentence[], c:MatchContext) => true)
//     const context = defaultMatchContext();
//     whereGroupSentences(groupSentences)(match, context);
//     expect(match.mock.calls[0][0]).toStrictEqual([
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'a', predicate:'bx', object:'cx', date:0},
//     ])
//     expect(match.mock.calls[0][1]).toStrictEqual(context);
//     expect(match.mock.calls[1][0]).toStrictEqual([
//         {subject:'d', predicate:'e', object:'f', date:0},
//         {subject:'d', predicate:'ey', object:'fy', date:0}
//     ])
//     expect(match.mock.calls[0][1]).toStrictEqual(context);
//   });
//   it('should only return groups for which the match return true', () => {
//     const match = jest.fn((s:Sentence[], c:MatchContext) => s[0].subject === 'a');
//     const context = defaultMatchContext();
//     expect(whereGroupSentences(groupSentences)(match, context)).toStrictEqual({
//       a:[
//         {subject:'a', predicate:'b', object:'c', date:0},
//         {subject:'a', predicate:'bx', object:'cx', date:0},
//       ], 
//     });
//   });
// });
// describe('groupToSentences', () => {
//   const groupSentences = {
//     a:[
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'a', predicate:'bx', object:'cx', date:0},
//     ],
//     d:[
//       {subject:'d', predicate:'e', object:'f', date:0},
//       {subject:'d', predicate:'ey', object:'fy', date:0}
//     ]
//   }
// 	it('flaten the group by to Sentences', () => {
//     expect(groupToSentences(groupSentences)).toStrictEqual([
//       {subject:'a', predicate:'b', object:'c', date:0},
//       {subject:'a', predicate:'bx', object:'cx', date:0},
//       {subject:'d', predicate:'e', object:'f', date:0},
//       {subject:'d', predicate:'ey', object:'fy', date:0}
//     ])

//   });
// });
it('', ()=> {});