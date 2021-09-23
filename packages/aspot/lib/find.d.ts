import { GroupSentences, Match, MatchContext, Sentence, Term, WhereMatch } from "./types";
export declare type GroupSentencesGen = (sentences: Sentence[]) => (part: Term) => GroupSentences;
declare const baseFindSentences: (from: Sentence[]) => (match?: Match, context?: MatchContext) => Sentence[];
declare const findSentences: (from: Sentence[]) => (match?: Match, context?: MatchContext) => Sentence[];
declare const groupSentences: (sentences: Sentence[]) => (part: Term) => GroupSentences;
declare const whereGroupSentences: (result: GroupSentences) => (match: WhereMatch, context?: MatchContext) => GroupSentences;
declare const groupToSentences: (group: GroupSentences) => Sentence[];
declare const addSentencesToContext: (name: string) => (sentences: Sentence[]) => (context: MatchContext) => {
    sentences: {
        [x: string]: Sentence[];
    };
};
export { findSentences, baseFindSentences, groupSentences, addSentencesToContext, whereGroupSentences, groupToSentences, };
