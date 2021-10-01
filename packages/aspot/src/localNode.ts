import { StoreNode, Watcher, WatcherGen, watcher } from "./basicStoreNode";
/*
const localDb = (name: string) => {
  const retriveDB = () => {
    if(typeof window !== 'undefined') {
      if (window.localStorage.getItem(name)) {
        return JSON.parse(window.localStorage.getItem(name)) as Database;
      }
    }
    return emptyDatabase();
  }
  const database = retriveDB();
  const writeDB = () => {
    if(typeof window !== 'undefined') {
      window.localStorage.setItem(name, JSON.stringify(database));
    }
  }
  const that = db(database);
  that.addWatcher(writeDB);
  return that;
}
*/
type LocalNodeDeps = {
  localStorage: Storage | undefined,
  watcher: WatcherGen,
}
const localNodeCore = (deps:LocalNodeDeps) =>  (name:string) =><A extends StoreNode> (node:A)  => {
  const { localStorage, watcher } = deps;
  const { get, set, watch } = node;
  const isTrue = () => true;
  const writeDB = () => {
    if(typeof localStorage !== 'undefined') {
      console.log('hi')
      localStorage.setItem(name, JSON.stringify(get(isTrue)));
    }

  }
  const retriveDB = () => {
    if(typeof localStorage !== 'undefined') {
      if (localStorage.getItem(name)) {
        set(...JSON.parse(localStorage.getItem(name)))
      }
    }
  }
  watch(watcher(writeDB)(isTrue));
  retriveDB();
  return node;
}
const localNode = localNodeCore({localStorage: typeof window !== 'undefined' ? window.localStorage: undefined, watcher});
export default localNode;
export {
  localNodeCore,
}