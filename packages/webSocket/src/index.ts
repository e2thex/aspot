import { Sentence, StoreNode } from '@aspot/core';
import { MD5 } from 'crypto-js';
const hash = (sentence:Sentence) => MD5(JSON.stringify(sentence)).toString() 
const webSocketConnectorCore = (deps) => (url:string, group:string) => (node:StoreNode) => {
  const {} = deps;
  if(typeof window !== 'undefined') {
    const recentSentences = []
    const onUpdate = (sentence:Sentence) => {
      recentSentences.push(hash(sentence))
      node.set(sentence);
    }
    const ws = new WebSocket(url);
    const ping = () => {
      ws.send(JSON.stringify({action:'ping'}));
      // While we are doing the ping we are going ro do some clean up on recentSentences so it does not get to big
      recentSentences.splice(0, Math.floor(recentSentences.length/2));
      window.setTimeout(ping, 60000);
    }
    ws.addEventListener('open', function (event) {
      ws.send(JSON.stringify({action:'join', group}));
      ws.send(JSON.stringify({action:'requestUpdates', group}));
      ws.addEventListener('message', (event) => {
        const {action, ...data } = JSON.parse(event.data);
        if(action === 'update') {
          data.sentences.forEach(onUpdate);
        }
        if(action === 'requestUpdates') {
          sendAllUpdate();
        }
      })
      ping();
    });
    const sendUpdate = (...sentences:Sentence[]) => {
      const newSentences = sentences.filter(s => !recentSentences.includes(hash(s)))
      if(newSentences.length > 0) {
        const pack = {action:'update', group, sentences:newSentences}
        ws.send(JSON.stringify(pack))
      }
    }
    const sendAllUpdate = () => {
      const sentences =  node.get(() => true);
      if (sentences.length > 0) {
        const pack = {action:'update', group, sentences}
        ws.send(JSON.stringify(pack))
      } 
    }
    node.watch(sendUpdate)

  }
}
const webSocketConnector = webSocketConnectorCore({});
export default webSocketConnector;