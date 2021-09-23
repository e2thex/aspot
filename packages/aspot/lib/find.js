"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupToSentences = exports.whereGroupSentences = exports.addSentencesToContext = exports.groupSentences = exports.baseFindSentences = exports.findSentences = void 0;
const lodash_1 = require("lodash");
const match_1 = require("./match");
const baseFindSentences = (from) => (match = match_1.isTrue, context = (0, match_1.defaultMatchContext)()) => (from.filter(s => match(s, context)));
exports.baseFindSentences = baseFindSentences;
const findSentences = (from) => (match = match_1.isTrue, context = (0, match_1.defaultMatchContext)()) => (baseFindSentences(from)((0, match_1.and)(match_1.objectExists, match), context));
exports.findSentences = findSentences;
const baseFind = ({ findSentences, result }) => (from) => (match, context) => result(findSentences(from)(match, context));
const groupSentences = (sentences) => (part) => {
    return sentences.reduce((result, sentence) => {
        const groupValue = sentence[part];
        if (groupValue && !result[groupValue])
            result[groupValue] = [];
        if (groupValue)
            result[groupValue].push(sentence);
        return result;
    }, {});
};
exports.groupSentences = groupSentences;
const whereGroupSentences = (result) => (match, context) => {
    return Object.keys(result).reduce((r, key) => {
        const s = result[key];
        if (match(s, context)) {
            r[key] = result[key];
        }
        return r;
    }, {});
};
exports.whereGroupSentences = whereGroupSentences;
const groupToSentences = (group) => (0, lodash_1.flatten)(Object.values(group));
exports.groupToSentences = groupToSentences;
const combineContext = (...contexts) => (contexts.reduce((result, context) => {
    return context ? Object.assign(Object.assign(Object.assign({}, result), context), { sentences: Object.assign(Object.assign({}, result.sentences), context.sentences) }) : result;
}, (0, match_1.defaultMatchContext)()));
const addSentencesToContext = (name) => (sentences) => (context) => (Object.assign(Object.assign({}, context), { sentences: Object.assign(Object.assign({}, context.sentences), { [name]: sentences }) }));
exports.addSentencesToContext = addSentencesToContext;
//# sourceMappingURL=find.js.map