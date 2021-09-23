"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.where = exports.basicWhere = exports.defaultMatchContext = exports.objectExists = exports.matchPartial = exports.joinPrev = exports.join = exports.objectIs = exports.predicateIs = exports.subjectIs = exports.is = exports.or = exports.and = exports.not = exports.isFalse = exports.isTrue = void 0;
const types_1 = require("./types");
const defaultMatchContext = () => ({ sentences: {} });
exports.defaultMatchContext = defaultMatchContext;
const isTrue = () => true;
exports.isTrue = isTrue;
const isFalse = () => false;
exports.isFalse = isFalse;
const not = (clause) => addMatchMeta((sentence, context) => !clause(sentence, context));
exports.not = not;
const and = (...clauses) => addMatchMeta((sentence, context) => (clauses.reduce((result, clause) => result && clause(sentence, context), true)));
exports.and = and;
const or = (...clauses) => addMatchMeta((sentence, context) => (clauses.reduce((result, clause) => result || clause(sentence, context), false)));
exports.or = or;
const regExOrCompare = (test) => (val) => ((test instanceof RegExp)
    ? (val.match(test) ? true : false)
    : val === test);
const is = (part) => (v) => addMatchMeta((sentence) => {
    const compare = sentence[part];
    if (!compare)
        return false;
    return regExOrCompare(v)(compare);
});
exports.is = is;
const join = (resultName) => (prev) => (next) => addMatchMeta((sentence, context) => {
    const { sentences } = context || defaultMatchContext();
    return sentences[resultName] ? sentences[resultName].map(s => s[prev]).includes(sentence[next]) : false;
});
exports.join = join;
const objectExists = (sentence) => sentence.object !== null;
exports.objectExists = objectExists;
const addMatchMeta = (match) => {
    return Object.assign(match, {
        or: (nextMatch) => or(match, nextMatch),
        and: (nextMatch) => and(match, nextMatch),
        simple: (sentence) => match(sentence),
    });
};
const subjectIs = (subject) => is(types_1.TermType.subject)(subject);
exports.subjectIs = subjectIs;
const predicateIs = (predicate) => is(types_1.TermType.predicate)(predicate);
exports.predicateIs = predicateIs;
const objectIs = (object) => is(types_1.TermType.object)(object);
exports.objectIs = objectIs;
const matchPartial = (search) => addMatchMeta(and(...Object.keys(search).map(s => is(s)(search[s]))));
exports.matchPartial = matchPartial;
const basicWhere = (props) => (part) => {
    const { is, join } = props;
    return {
        match: is(part),
        matchPrev: (prevPart) => join('prev')(prevPart)(part),
        matchWith: (search) => (prevPart) => join(search)(prevPart)(part),
    };
};
exports.basicWhere = basicWhere;
const where = basicWhere({ is, join });
exports.where = where;
const joinPrev = join('prev');
exports.joinPrev = joinPrev;
//# sourceMappingURL=match.js.map