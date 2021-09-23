"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroupByResult = exports.addNextAsResult = exports.sentencesBasicResult = exports.addContextResult = exports.addSentenceResult = exports.addSubjectAsNodesResult = exports.addSubjectAsNodeResult = exports.addObjectAsNodesResult = exports.addObjectAsNodeResult = void 0;
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
exports.default = sentencesResult;
//# sourceMappingURL=sentenceResult.js.map