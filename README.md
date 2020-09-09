# Simple Peer JS

Simple peer-to-peer with WebRTC.

Basically: [simple-peer](https://github.com/feross/simple-peer) + [PeerJs](https://github.com/peers/peerjs)

This project uses the signal exchange mechanism of PeerJs with the WebRTC implementation of simple-peer.

**This works in nodeand the browser**

See [examples]('./examples) for code examples!

## Setup

**Include the library**

with npm: `npm install simple-peerjs` and the usage:

```js
import SimplePeerJs from 'simple-peerjs';
```

**Create a peer**

```js
const connMan = new SimplePeerJs('pick-an-id');
// You can pick your own id or omit the id if you want to get a random one from the server.
```

## Data Connections

**Connect**

```js
const conn = await connMan.connect('another-peer-id');

// conn.peer is an instance of simple-peer
conn.peer.send('hi!');
```

**Receive**

```js
connMan.on('connection', conn => {
  console.log('Peer connected:', conn.peerId);

  // conn.peer is an instance of simple-peer
  conn.peer.send('hello!');

  conn.peer.on('data', data => {
    console.log(data.toString());
  });
});
```

## Media calls

TODO:

## License

SimplePeerJS is licensed under the [MIT License](https://tldrlegal.com/l/mit).
