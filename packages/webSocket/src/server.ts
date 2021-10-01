import WebSocket, {WebSocketServer } from 'ws';
import { WebSocket as WST, WebSocketServer as WSST } from 'typestub-ws';

const WS = WebSocket as WST;
const WSS = WebSocketServer as WSST;
const wss = new WebSocketServer({ port: 8080 }) as WSST;
const groups = {};
wss.on('connection', (ws:WST) => {
  ws.on('message', (message, isBinary) => {
    console.log('received: %s', message);
    const {action, group, ...data} = JSON.parse(message.toString() as string);
    if(action === 'join') {
      if(!groups[group]) groups[group] = [];
      groups[group].push(ws);
    }
    if(action === 'update' || action === 'requestUpdates') {
      groups[group].forEach((client) => {
        if(client !== ws) client.send(message, {binary: isBinary});
      });
    }
  });
});
console.log("listening on 8080");