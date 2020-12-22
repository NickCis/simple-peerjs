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
const SimplePeerJs = require('simple-peerjs');
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
connMan.on('connect', conn => {
  console.log('Peer connected:', conn.peerId);

  // conn.peer is an instance of simple-peer
  conn.peer.send('hello!');

  conn.peer.on('data', data => {
    console.log(data.toString());
  });
});
```

## Media calls

Passing a stream is similar to [simple-peer](https://github.com/feross/simple-peer#videovoice)

```js
const SimplePeerJs = require('simple-peerjs');

async function main() {
  const peer = new SimplePeerJs();

  peer.on('connect', connection => {
    connection.peer.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      const video = document.querySelector('video');
      video.srcObject = stream;
      video.play();
    });
  });

  // get peer id
  const peerId = await peer.id;

  // get video/voice stream
  const stream = navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const initiator = new SimplePeerJs();
  const initiatorConnection = await initiator.connect(peerId, { stream });
}

main();
```

It also can be done [dynamically](https://github.com/feross/simple-peer#dynamic-videovoice)

```js
const SimplePeerJs = require('simple-peerjs');

async function main() {
  const peer = new SimplePeerJs();

  peer.on('connect', connection => {
    connection.peer.on('stream', stream => {
      // got remote video stream, now let's show it in a video tag
      const video = document.querySelector('video');
      video.srcObject = stream;
      video.play();
    });
  });

  // get peer id
  const peerId = await peer.id;

  const initiator = new SimplePeerJs();
  const initiatorConnection = await initiator.connect(peerId);

  setTimeout(async () => {
    // get video/voice stream
    const stream = navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    initiator.addStream(stream);
  }, 10000);
}

main();
```

## In Node

To use this library in Node, pass in `opts.wrtc`, `opts.fetch` and `opts.WebSocket` as a parameters:

```js
const wrtc = require('wrtc');
const fetch = require('node-fetch');
const WebSocket = require('ws');
const SimplePeerJs = require('simple-peerjs');

const peer = new SimplePeerJs({
  wrtc,
  fetch,
  WebSocket,
})
```

## Api

### `peer = new SimplePeerJs(opts)`

Creates a SimplePeerJs instance which delegates signaling to PeerJs and creates simple-peer WebRTC channels.

The following properties can be specified on `opts`:
 - `id`: PeerJs id (if absent, peerjs server will assign a free id)
 - `simplePeer`: [`simple-peer` configuration options](https://github.com/feross/simple-peer#peer--new-peeropts)
 - `wrtc`: custom webrtc implementation, mainly useful in node to specify in the wrtc package. Contains an object with the properties:
   - [RTCPeerConnection](https://www.w3.org/TR/webrtc/#dom-rtcpeerconnection)
   - [RTCSessionDescription](https://www.w3.org/TR/webrtc/#dom-rtcsessiondescription)
   - [RTCIceCandidate](https://www.w3.org/TR/webrtc/#dom-rtcicecandidate)
 - `fetch`: [fetch-like](https://fetch.spec.whatwg.org/) function implementation
 - `WebSocket`: [WebSocket-like](https://www.w3.org/TR/websockets/) implementation

### `peer.id`

Promise that resolves to the peer id

### `peer.connect(peerId, opts)`

Tries to connect to `peerId`. Returns a promise with an object that has a simple-peer instance on the `peer` property.

The second parameter, `opts`, is optional. If passed, it will be used as the simple-peer configuration.

### `peer.close()`

Closes Signaling connection to PeerJS and all active peer connections.

## Events

SimplePeerJs objects are instances of `EventEmitter`.

### `peer.on('connect', connection)`

Emitted when a new connection has been created. `connection` has a `peer` property which is a simple-peer object.

### `peer.on('error', error)`

Emitted on every error.

## License

SimplePeerJS is licensed under the [MIT License](https://tldrlegal.com/l/mit).
