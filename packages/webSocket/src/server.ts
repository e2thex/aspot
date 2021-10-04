import WebSocket, {WebSocketServer } from 'ws';
import { WebSocket as WST, WebSocketServer as WSST } from 'typestub-ws';

const WS = WebSocket as WST;
const WSS = WebSocketServer as WSST;
const groups = {};
const port = process.argv[2] || process.env.PORT || 80
console.log(process.argv);
const wss = new WebSocketServer({ port }) as WSST;
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
console.log(`listening om ${port}`);