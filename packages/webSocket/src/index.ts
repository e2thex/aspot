import { Sentence, StoreNode } from '@aspot/core';
import { MD5 } from 'crypto-js';
const webSocketConnectorCore = (deps) => (url:string, group:string) => (node:StoreNode) => {
  const {} = deps;
  if(typeof window !== 'undefined') {
    const recentSentences = []
    const onUpdate = (sentence:Sentence) => {
      recentSentences.push(MD5(JSON.stringify(sentence)))
      node.set(sentence);
    }
    const ws = new WebSocket(url);
    const ping = () => {
      ws.send(JSON.stringify({action:'ping'}));
      // Why we are doing the ping we are going to hackaly do some clean up on recentSentences
      recentSentences.shift();
      window.setTimeout(ping, 2000);
    }
    ws.addEventListener('open', function (event) {
      ws.send(JSON.stringify({action:'join', group}));
      ws.send(JSON.stringify({action:'requestUpdates', group}));
      ws.addEventListener('message', (event) => {
        const {action, ...data } = JSON.parse(event.data);
        console.log(data);
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
      const newSentences = sentences.filter(s => !recentSentences.includes(MD5(JSON.stringify(s))))
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