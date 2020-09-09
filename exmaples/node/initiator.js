const fetch = require('node-fetch');
const WebSocket = require('ws');
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const ConnectionManager = require('../../src/ConnectionManager');

async function main() {
  const peerId = process.argv[2];
  const connectionManager = new ConnectionManager({ fetch, WebSocket, wrtc });
  const conn = await connectionManager.connect(peerId);

  console.log('Connected to peer!');
  conn.peer.send('hey peer, how are you?');

  conn.peer.on('data', data => {
    console.log('Received data ::', data.toString());
  });
}

main();
