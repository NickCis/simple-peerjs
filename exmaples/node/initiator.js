const fetch = require('node-fetch');
const WebSocket = require('ws');
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const SimplePeerJs = require('../../src');

async function main() {
  const peerId = process.argv[2];
  if (!peerId) {
    consoele.log('Please pass the peerId');
    process.exit(-1);
  }
  const connectionManager = new SimplePeerJs({ fetch, WebSocket, wrtc });
  const conn = await connectionManager.connect(peerId);

  console.log('Connected to peer!');
  conn.peer.send('hey peer, how are you?');

  conn.peer.on('data', data => {
    console.log('Received data ::', data.toString());
  });
}

main();
