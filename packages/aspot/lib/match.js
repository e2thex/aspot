"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMatchContext = exports.objectExists = exports.joinPrev = exports.join = exports.objectIs = exports.predicateIs = exports.subjectIs = exports.has = exports.or = exports.and = exports.not = exports.isFalse = exports.isTrue = void 0;
const types_1 = require("./depricated/types");
const defaultMatchContext = () => ({ sentences: {} });
exports.defaultMatchContext = defaultMatchContext;
const isTrue = (context) => (sentence) => true;
exports.isTrue = isTrue;
const isFalse = (context) => (sentence) => false;
exports.isFalse = isFalse;
const not = (clause) => (context) => (sentence) => !clause(context)(sentence);
exports.not = not;
const and = (...clauses) => (context) => (sentence) => (clauses.reduce((result, clause) => result && clause(context)(sentence), true));
exports.and = and;
const or = (...clauses) => (context) => (sentence) => (clauses.reduce((result, clause) => result || clause(context)(sentence), false));
exports.or = or;
const has = (part) => (v) => (context) => (sentence) => {
    const regExOrCompare = (test) => (val) => ((test instanceof RegExp)
        ? (val.match(test) ? true : false)
        : val === test);
    const compare = sentence[part];
    if (!compare)
        return false;
    return regExOrCompare(v)(compare);
};
exports.has = has;
const join = (resultName) => (prev) => (next) => (context) => (sentence) => {
    return context.has(resultName) ? context.get(resultName).sentences().map(s => s[prev]).includes(sentence[next]) : true;
};
exports.join = join;
const objectExists = (sentence) => sentence.object !== null;
exports.objectExists = objectExists;
const joinPrev = join('prev');
exports.joinPrev = joinPrev;
const subjectIs = (subject) => has(types_1.TermType.subject)(subject);
exports.subjectIs = subjectIs;
const predicateIs = (predicate) => has(types_1.TermType.predicate)(predicate);
exports.predicateIs = predicateIs;
const objectIs = (object) => has(types_1.TermType.object)(object);
exports.objectIs = objectIs;
const matchPartial = (search) => and(...Object.keys(search).map(s => has(s)(search[s])));
//# sourceMappingURL=match.js.map