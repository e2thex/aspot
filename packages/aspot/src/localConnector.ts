import { StoreNode, Watcher, WatcherGen, watcher } from "./basicStoreNode";
type LocalConnectorDeps = {
  localStorage: Storage | undefined,
  watcher: WatcherGen,
}
const localConnectorCore = (deps:LocalConnectorDeps) =>  (name:string) =><A extends StoreNode> (node:A)  => {
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
}
const localConnector = localConnectorCore({localStorage: typeof window !== 'undefined' ? window.localStorage: undefined, watcher});
export default localConnector;
export {
  localConnectorCore,
}