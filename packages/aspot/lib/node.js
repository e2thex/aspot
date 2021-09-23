"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const match_1 = require("./match");
const types_1 = require("./types");
const watcher = (match) => (action) => (sentence) => {
    if (match(sentence))
        action();
};
const setValue = (props) => (object) => {
    const { onIs, subject, predicate, update } = props;
    if (onIs)
        onIs();
    update({ subject, predicate, object, date: Date.now() });
};
const deleteValue = (props) => (depth) => {
    const { list, subject, predicate, update } = props;
    if (depth > 0)
        list().del(depth);
    update({ subject, predicate, object: null, date: Date.now() });
};
const nextPredicateNode = (props) => (newPredicateIn) => {
    const { val, defaultValue, onIs, subject, predicate, update, baseProps, funcs } = props;
    const newPredicate = newPredicateIn || (0, uuid_1.v4)().toString();
    const object = defaultValue();
    return val()
        ? basePredicateNode(funcs)(baseProps)(object)(newPredicate)
        : basePredicateNode(funcs)(baseProps)(object)(newPredicate, (() => setValue({ onIs, subject, predicate, update })(object)));
};
const basePredicateNode = (func) => (props) => (subject) => (predicate, onIs) => {
    const { nextPredicateNode, deleteValue, setValue } = func;
    const { update, find, addWatcher, node } = props;
    const onUpdates = [];
    const match = (0, match_1.and)((0, match_1.subjectIs)(subject), (0, match_1.predicateIs)(predicate));
    const getValue = () => (find(match).sentence.part(types_1.TermType.object));
    const defaultValue = () => getValue() || subject + predicate;
    const val = () => {
        addWatcher(watcher(match)(() => onUpdates.forEach(update => update(getValue()))));
        return getValue();
    };
    const list = () => node(defaultValue());
    const predicateNode = {
        is: setValue({ onIs, subject, predicate, update }),
        s: nextPredicateNode({ val, defaultValue, onIs, subject, predicate, update, baseProps: props }),
        val,
        list,
        del: deleteValue({ list: () => node(defaultValue()), subject, predicate, update }),
        on: (f) => onUpdates.push(f),
        predicate: () => predicate,
        find: (match) => find((0, match_1.and)((0, match_1.subjectIs)(defaultValue()), match)),
    };
    return predicateNode;
};
const predicateNode = basePredicateNode({ nextPredicateNode, deleteValue, setValue });
//# sourceMappingURL=node.js.map