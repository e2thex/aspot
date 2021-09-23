"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHavingResult = exports.addPartResult = exports.renameToAsNodes = exports.addDegroupResult = exports.addGroupedSentencesResult = exports.addGroupByResult = exports.addNextAsResult = exports.sentencesBasicResult = exports.addContextResult = exports.addSentenceResult = exports.addSubjectAsNodesResult = exports.addSubjectAsNodeResult = exports.addObjectAsNodesResult = exports.addObjectAsNodeResult = exports.sentencesResult = void 0;
const lodash_1 = require("lodash");
const find_1 = require("./find");
const match_1 = require("./match");
const sentencesBasicResult = (sentences) => (result) => (Object.assign(Object.assign({}, result), { sentences: () => sentences }));
exports.sentencesBasicResult = sentencesBasicResult;
const addSentenceResult = (result) => (Object.assign(Object.assign({}, result), { sentence: () => result.sentences()[0] || null }));
exports.addSentenceResult = addSentenceResult;
const addSubjectAsNodesResult = (subjectNode) => (result) => (Object.assign(Object.assign({}, result), { subjectAsNodes: () => [...new Set(result.sentences()
            .map(s => s.subject))]
        .map(s => subjectNode(s)) }));
exports.addSubjectAsNodesResult = addSubjectAsNodesResult;
const addObjectAsNodesResult = (predicateNode) => (result) => (Object.assign(Object.assign({}, result), { objectAsNodes: () => result.sentences().map(s => predicateNode(s.subject)(s.predicate)) }));
exports.addObjectAsNodesResult = addObjectAsNodesResult;
const addObjectAsNodeResult = (result) => (Object.assign(Object.assign({}, result), { objectAsNode: () => result.objectAsNodes()[0] || null }));
exports.addObjectAsNodeResult = addObjectAsNodeResult;
const addSubjectAsNodeResult = (result) => (Object.assign(Object.assign({}, result), { subjectAsNode: () => result.subjectAsNodes()[0] || null }));
exports.addSubjectAsNodeResult = addSubjectAsNodeResult;
const addContextResult = (context) => (result) => (Object.assign(Object.assign({}, result), { context: () => context || (0, match_1.defaultMatchContext)() }));
exports.addContextResult = addContextResult;
const addNextAsResult = (find) => (result) => (Object.assign(Object.assign({}, result), { nextAs: (name) => (match) => (find(match, (0, find_1.addSentencesToContext)(name)(result.sentences())(result.context()))) }));
exports.addNextAsResult = addNextAsResult;
const addNextResult = (result) => (Object.assign(Object.assign({}, result), { next: result.nextAs('prev') }));
const addGroupByResult = (group) => (result) => (Object.assign(Object.assign({}, result), { groupBy: (part) => group(part)(result.sentences(), result.context()) }));
exports.addGroupByResult = addGroupByResult;
const sentencesResult = (props) => (sentences, context) => (0, lodash_1.flow)(addNextResult, addNextAsResult(props.find), addSubjectAsNodeResult, addSubjectAsNodesResult(props.subjectNode), addObjectAsNodeResult, addObjectAsNodesResult(props.predicateNode), addSentenceResult, addContextResult(context), sentencesBasicResult(sentences))({});
exports.sentencesResult = sentencesResult;
const addPartResult = (part) => (result) => (Object.assign(Object.assign({}, result), { part: () => part }));
exports.addPartResult = addPartResult;
const addGroupedSentencesResult = (groupSentences) => (result) => (Object.assign(Object.assign({}, result), { groupedSentences: () => groupSentences(result.part())(result.sentences(), result.context()) }));
exports.addGroupedSentencesResult = addGroupedSentencesResult;
const addDegroupResult = (sentencesResult) => (result) => (Object.assign(Object.assign({}, result), { degroup: () => sentencesResult(result.sentences(), result.context()) }));
exports.addDegroupResult = addDegroupResult;
const renameToAsNodes = (result) => {
    const { subjectAsNodes } = result, rest = __rest(result, ["subjectAsNodes"]);
    return Object.assign(Object.assign({}, rest), { asNode: subjectAsNodes });
};
exports.renameToAsNodes = renameToAsNodes;
const addAsNodesResult = (subjectNode) => (result) => (0, lodash_1.flow)(renameToAsNodes, addSubjectAsNodesResult(subjectNode))(result);
const addHavingResult = (props) => (result) => {
    const { groupResult, groupToSentences, whereGroupSentences } = props;
    const { context, part, groupedSentences } = result;
    return Object.assign(Object.assign({}, result), { having: (match) => (groupResult(result.part())(groupToSentences(whereGroupSentences(groupedSentences())(match, context())), context())) });
};
exports.addHavingResult = addHavingResult;
const groupResult = (props) => (sentences, context) => (part) => (0, lodash_1.flow)(sentencesBasicResult(sentences), addContextResult(context), addPartResult(part), addGroupedSentencesResult(props.groupSentences), addAsNodesResult(props.subjectNode), addDegroupResult(props.sentenceResult), addHavingResult({ whereGroupSentences: find_1.whereGroupSentences, groupToSentences: find_1.groupToSentences, groupResult: props.group }))({});
//# sourceMappingURL=result.js.map