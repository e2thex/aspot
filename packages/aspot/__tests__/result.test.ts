import { exportAllDeclaration } from '@babel/types';
import { iteratee } from 'lodash';
import { isExportDeclaration } from 'typescript';
import jestConfig from '../jest.config';
import { defaultMatchContext, isTrue } from '../lib/match';
import { addContextResult, addGroupByResult, addNextAsResult, addObjectAsNodeResult, addObjectAsNodesResult, addSentenceResult, addSubjectAsNodeResult, addSubjectAsNodesResult, sentencesBasicResult, addGroupedSentencesResult, addDegroupResult, renameToAsNodes, addPartResult, addHavingResult } from '../lib/result'
import { Match, MatchContext, Sentence, Term, TermType, GroupSentences, WhereMatch } from '../lib/types';
describe('sentenceResultStart', () => {
	it('should return an object with a member that returns the sentenses add', () => {
    const sentences = [
      {subject:'d', predicate:'e', object:'f', date:0},
      {subject:'d', predicate:'ey', object:'fy', date:0}
    ];
    expect(sentencesBasicResult(sentences)({}).sentences()).toStrictEqual(sentences);
  });
});
describe('addsentenceResult', () => {
	it('should return an object that has a method sentence which uses its sentenses method to get the first member.', () => {
    const sentences = [
      {subject:'d', predicate:'e', object:'f', date:0},
      {subject:'d', predicate:'ey', object:'fy', date:0}
    ];
    const result = {
      sentences: jest.fn(() => sentences)
    };
    expect(addSentenceResult(result).sentence()).toStrictEqual(sentences[0]);
  });
	it('should return an object that has a method sentence which returns null if there are no sentences', () => {
    const sentences = [
    ];
    const result = {
      sentences: jest.fn(() => sentences)
    };
    expect(addSentenceResult(result).sentence()).toStrictEqual(null);
  });
});
describe('addSubjectAsNodesResult', () => {
	it('return the object taken in with a new method addSubjectNodes that returns an array of Subject Nodes', () => {
    const fakeSubject = (s:string) => ({s});
    const sentences = [
      {subject:'d', predicate:'e', object:'f', date:0},
      {subject:'e', predicate:'ey', object:'fy', date:0}
    ];
    const result = {
      sentences: jest.fn(() => sentences)
    };
    expect(addSubjectAsNodesResult(fakeSubject)(result).subjectAsNodes()).toStrictEqual([
      fakeSubject('d'),
      fakeSubject('e')
    ])
  });
	it('also dedup results', () => {
    const fakeSubject = (s:string) => ({s});
    const sentences = [
      {subject:'d', predicate:'e', object:'f', date:0},
      {subject:'d', predicate:'ey', object:'fy', date:0}
    ];
    const result = {
      sentences: jest.fn(() => sentences)
    };
    expect(addSubjectAsNodesResult(fakeSubject)(result).subjectAsNodes()).toStrictEqual([
      fakeSubject('d'),
    ])
  });
});
describe('addSubjectAsNodeResult', () => {
  it('return the object taken in with a new method addSubjectNodes that returns the first item in the array from subjectAsNodes', () => {
    const fakeSubject = (s:string) => ({s});
    const fakeResult = {
      subjectAsNodes: () => [
        {s:'a'},
        {s:'b'}
      ],
      sentences: () => []
    }
    expect(addSubjectAsNodeResult(fakeResult).subjectAsNode()).toStrictEqual({s:'a'})
  });
  it('also return null if no nodes', () => {
    const fakeSubject = (s:string) => ({s});
    const fakeResult = {
      subjectAsNodes: () => [
      ],
      sentences: () => [],
    }
    expect(addSubjectAsNodeResult(fakeResult).subjectAsNode()).toStrictEqual(null)
  });

});
describe('addObjectAsNodesResult', () => {
	it('return the object taken in with a new method addObjectNodes that returns an array of Predicate Nodes', () => {
    const fakePredicate = (s:string) => (p:string) => ({s,p});
    const sentences = [
      {subject:'d', predicate:'e', object:'f', date:0},
      {subject:'e', predicate:'ey', object:'fy', date:0}
    ];
    const result = {
      sentences: jest.fn(() => sentences)
    };
    expect(addObjectAsNodesResult(fakePredicate)(result).objectAsNodes()).toStrictEqual([
      fakePredicate('d')('e'),
      fakePredicate('e')('ey')
    ])
  });
});
describe('addObjectAsNodeResult', () => {
  it('return the object taken in with a new method addObjectNodes that returns the first item in the array from objectAsNodes', () => {
    const fakeObject = (s:string) => (p:string) => ({s,p});
    const fakeResult = {
      objectAsNodes: () => [
        {s:'a', p:'d'},
        {s:'b', p:'e'}
      ],
      sentences: () => []
    }
    expect(addObjectAsNodeResult(fakeResult).objectAsNode()).toStrictEqual({s:'a', p:'d'})
  });
  it('also return null if no nodes', () => {
    const fakeSubject = (s:string) => ({s});
    const fakeResult = {
      objectAsNodes: () => [
      ],
      sentences: () => []
    }
    expect(addObjectAsNodeResult(fakeResult).objectAsNode()).toStrictEqual(null)
  });

});
describe('addContextResult', () => {
  it('returns an object that has a context function and will return the context', () => {
    const context = {sentences:{test:[]}};
    expect(addContextResult(context)({}).context()).toStrictEqual(context);
  });
  it('also maintain items from the result', () => {
    const context = {sentences:{test:[]}};
    const result:{a: string} = { a: 'b' };
    expect(addContextResult(context)(result).a).toStrictEqual('b');
  });
});
describe('addNextAsResult', () => {
  it('Adds a NextAs to the Result that call the find function with a match', () => {
    const result = {
      sentences: () => [],
      context: () => defaultMatchContext()
    }
    const find = jest.fn((match:Match, Context:MatchContext) => {})
    addNextAsResult(find)(result).nextAs('name')(isTrue)
    expect(find.mock.calls[0][0]).toStrictEqual(isTrue)
  });
  it('and the NextAs adds all of the sentences to the context under the provide name in addition to other items of the context', () => {
    const result = {
      sentences: () => [
        {subject:'d', predicate:'e', object:'f', date:0}, 
      ],
      context: () => ({
        sentences: {
          prev: [
            {subject:'x', predicate:'y', object:'z', date:0},
          ]
        }
      }) 
    }
    const find = jest.fn((match:Match, Context:MatchContext) => {})
    addNextAsResult(find)(result).nextAs('name')(isTrue)
    expect(find.mock.calls[0][1]).toStrictEqual({
      sentences: {
        name: [{subject:'d', predicate:'e', object:'f', date:0}],
        prev: [{subject:'x', predicate:'y', object:'z', date:0}]
      }
    });
  });
});
describe('addGroupByResult', () => {
  it('adds groupby to object that takes a term and pass those to the group function along with the sentences and context', () => {
    const result = {
      sentences: () => [
        {subject:'d', predicate:'e', object:'f', date:0},
        {subject:'e', predicate:'ey', object:'fy', date:0}
      ],
      context: () => defaultMatchContext(),
    };
    const group1 = jest.fn((s:Sentence[], c?:MatchContext) => {})
    const group = jest.fn((part:Term) => group1)
    addGroupByResult(group)(result).groupBy(TermType.subject);
    expect(group.mock.calls[0][0]).toBe(TermType.subject);
    expect(group1.mock.calls[0][0]).toStrictEqual([ {subject:'d', predicate:'e', object:'f', date:0},
    {subject:'e', predicate:'ey', object:'fy', date:0}]);
    expect(group1.mock.calls[0][1]).toStrictEqual(defaultMatchContext());

  });
});
describe('addPartResult', () => {
  it('should add a method that return the part', () => {
    const result = {};
    expect(addPartResult(TermType.object)(result).part()).toBe(TermType.object)
  });
  it('should also pass in any thing from the first result', () => {
    const result = {a:() => 'b'} as { a:()=>string };
    expect(addPartResult(TermType.object)(result).a()).toBe('b')
  });
});
  
   
describe('addGroupedSentencesResult', () => {
  it('adds a groupedSentences property that returns the value froma groupedSentences function', () => {
    const result = {
      sentences: () => [
        {subject:'d', predicate:'e', object:'f', date:0},
        {subject:'e', predicate:'ey', object:'fy', date:0}
      ],
      context: () => defaultMatchContext(),
      part: () => TermType.subject
    };
    const groupSentences0 = jest.fn((s:Sentence[], context?:MatchContext) => ({} as GroupSentences));
    const groupSentences = jest.fn((p:Term) => groupSentences0);
    addGroupedSentencesResult(groupSentences)(result).groupedSentences();
    expect(groupSentences.mock.calls[0][0]).toStrictEqual(TermType.subject);
    expect(groupSentences0.mock.calls[0][0]).toStrictEqual(result.sentences());
    expect(groupSentences0.mock.calls[0][1]).toStrictEqual(result.context());
  });
}); 
describe('addDegroupResult', () => {
  it('adds a degroupResult that pass the sentences a context to a sentencesResult generator', () => {
    const result = {
      sentences: () => [
        {subject:'d', predicate:'e', object:'f', date:0},
        {subject:'e', predicate:'ey', object:'fy', date:0}
      ],
      context: () => defaultMatchContext(),
    };
    const sentencesResult = jest.fn((s:Sentence[], context?:MatchContext) => ({}));
    addDegroupResult(sentencesResult)(result).degroup();
    expect(sentencesResult.mock.calls[0][0]).toStrictEqual(result.sentences());
    expect(sentencesResult.mock.calls[0][1]).toStrictEqual(result.context());
  });
}); 
describe('renameToAsNodes', () => {
  it('rename subjectAsNodes to asNodes', () => {
    const result = {
      subjectAsNodes: () => [],
    };
    expect(renameToAsNodes(result).asNode).toStrictEqual(result.subjectAsNodes)
  });
}); 
describe('addHavingResult', () => {
  const result = {
    groupedSentences: () => ({
      a:[
        {subject:'a', predicate:'b', object:'c', date:0},
        {subject:'a', predicate:'bx', object:'cx', date:0},
      ],
      d:[
        {subject:'d', predicate:'e', object:'f', date:0},
        {subject:'d', predicate:'ey', object:'fy', date:0}
      ]
    }),
    context: defaultMatchContext,
    part: () => TermType.subject,
  };
  const whereGroupSentences0 = jest.fn((m:WhereMatch, c:MatchContext) => ({a:[{subject:'s', object:'o', predicate:'p', date:0}]}))
  const whereGroupSentences = jest.fn((g:GroupSentences) => whereGroupSentences0);
  const groupToSentences = jest.fn((g:GroupSentences) => [{subject:'s', object:'o', predicate:'p', date:0}])
  const groupResult0 = jest.fn((sentences: Sentence[], Context?: MatchContext) => ({a:'b'}))
  const groupResult = jest.fn((p:Term) => groupResult0)
  const match = () => true;
  it('result of groupResult will be returned', () => {
    expect(addHavingResult({groupResult, whereGroupSentences, groupToSentences })(result).having(match)).toStrictEqual({a:'b'});
  })
  describe('Adds a having method that', () => {
    it('That where Group sentences will be called with the results groupSentences and context as well as the match', () => {
      expect(whereGroupSentences.mock.calls[0][0]).toStrictEqual(result.groupedSentences());
      expect(whereGroupSentences0.mock.calls[0][0]).toStrictEqual(match);
      expect(whereGroupSentences0.mock.calls[0][1]).toStrictEqual(result.context());
    });
    it('and the result of whereGroupSentences will be pass to groupToSentences', () => {
      expect(groupToSentences.mock.calls[0][0]).toStrictEqual({a:[{subject:'s', object:'o', predicate:'p', date:0}]})
    });
    it('and the result of groupToSentences as well as the part and context from the result will be passed to groupResult', () => {
      expect(groupResult.mock.calls[0][0]).toBe(result.part())
      expect(groupResult0.mock.calls[0][0]).toStrictEqual([{subject:'s', object:'o', predicate:'p', date:0}]);
      expect(groupResult0.mock.calls[0][1]).toStrictEqual(result.context())
    });
  });
}); 