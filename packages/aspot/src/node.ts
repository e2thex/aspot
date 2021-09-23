import { v4 } from 'uuid';
import { and, predicateIs, subjectIs, is } from "./match";
import { Match, NodeProps, OnFunc, OnIs, PredicateNode, Sentence, SubjectNode, TermType, UpdateFuc } from "./types";

// @TODO: Test
const watcher = (match:Match) => (action:() => void) => (sentence:Sentence) => {
  if(match(sentence)) action();
}
type SetValueProps = {
  onIs:OnIs | null,
  subject:string,
  predicate:string,
  update: UpdateFuc,
}
// @TODO: Test
const setValue = (props:SetValueProps)  => (object:string|null) => {
  const { onIs, subject, predicate, update } = props;
  if(onIs) onIs();
  update({subject, predicate, object, date:Date.now()} );
	}
type DeleteValueProps = {
  list:() => SubjectNode,
  subject:string,
  predicate:string,
  update: UpdateFuc,
}
// @TODO: Test
const deleteValue = (props:DeleteValueProps) =>(depth:number) => {
    const { list, subject, predicate, update } = props;
    if (depth>0) list().del(depth)
	  update({subject, predicate, object:null, date:Date.now()})
}
// @TODO test
const nextPredicateNode = (props) => (newPredicateIn?:string) => {
  const { val, defaultValue, onIs, subject, predicate, update, baseProps, funcs } = props;
  const newPredicate = newPredicateIn || v4().toString();
  const object = defaultValue();
  return val() 
    ? basePredicateNode(funcs)(baseProps)(object)(newPredicate)
    : basePredicateNode(funcs)(baseProps)(object)(newPredicate, (() => setValue({ onIs, subject, predicate, update })(object))) ;
}
const basePredicateNode = (func) => (props:NodeProps) => (subject:string) => (predicate:string, onIs?:OnIs) =>{
	const {nextPredicateNode, deleteValue, setValue} = func;
  const {update, find, addWatcher, node } = props
  const onUpdates = [] as OnFunc[];
  const match = and(subjectIs(subject), predicateIs(predicate)) 
  const getValue = () => (
    find(match).sentence.part(TermType.object)
  )
  const defaultValue = () => getValue() || subject + predicate
	const val = () => {
    addWatcher(watcher(match)(() => onUpdates.forEach(update => update(getValue()))))
	  return getValue();
	}
	const list = () => node(defaultValue());
  const predicateNode = {
	  is: setValue({ onIs, subject, predicate, update }),
    s: nextPredicateNode({val, defaultValue, onIs, subject, predicate, update, baseProps:props}),
    val,
    list,
    del: deleteValue({ list:() => node(defaultValue()), subject, predicate, update }), 
    on: (f:OnFunc) => onUpdates.push(f), 
    predicate: () => predicate, 
    find: (match:Match) => find(and(subjectIs(defaultValue()), match)),
	};
  return predicateNode  as PredicateNode;
}
const predicateNode = basePredicateNode({nextPredicateNode, deleteValue, setValue });