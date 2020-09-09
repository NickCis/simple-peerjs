const fetch = require('node-fetch');
const WebSocket = require('ws');
const Peer = require('simple-peer');
const wrtc = require('wrtc');
const SimplePeerJs = require('../../src');

async function main() {
  const connectionManager = new SimplePeerJs({ fetch, WebSocket, wrtc });
  const peerId = await connectionManager.id;
  console.log('My peer id:', peerId);

  connectionManager.on('connect', conn => {
    console.log('Peer connected:', conn.peerId);
    conn.peer.on('data', data => {
      console.log('Received data ::', data.toString());
      conn.peer.send('Fineee :)');
    });
  });
}

main();
