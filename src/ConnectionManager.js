const { EventEmitter } = require('eventemitter3');
const Peer = require('simple-peer');
const Signaler = require('./Signaler');
const { randomToken } = require('./util');
const { PeerEventType, PeerErrorType, IceServers } = require('./constants');

class ConnectionManager extends EventEmitter {
  constructor(opts) {
    super();
    this.options = {
      ...opts,
      simplePeer: {
        ...(opts && opts.simplePeer),
        config: {
          iceServers: IceServers,
          ...(opts && opts.simplePeer && opts.simplePeer.config),
        },
      },
    };
    this.connections = {};
    this.signaler = new Signaler(this.options);
    this.id = new Promise(rs => {
      this.signaler.once(PeerEventType.Open, rs);
    });

    this.signaler.on(PeerEventType.Signal, ({ peerId, id, signal }) => {
      if (!this.connections[id])
        this.connections[id] = this.createPeer(id, peerId);

      this.connections[id].peer.signal(signal);
    });

    this.signaler.on(PeerEventType.Error, error => {
      switch (error.type) {
        case PeerErrorType.PeerUnavailable:
          for (const key of Object.keys(this.connections)) {
            const conn = this.connections[key];
            if (conn.peerId === error.peerId) {
              if (conn.reject) conn.reject(error);
              delete this.connections[key];
            }
          }
          break;

        default:
          this.emit('error', error);
          break;
      }
    });
  }

  createPeer(id, peerId, opts, extra) {
    const conn = {
      ...extra,
      id,
      peerId,
      peer: new Peer({
        wrtc: this.options.wrtc,
        ...this.options.simplePeer,
        ...opts,
      }),
    };

    let connected = false;

    conn.peer.on('signal', data => {
      this.signaler.signal(peerId, data, id);
    });

    conn.peer.on('connect', () => {
      connected = true;
      this.emit('connect', conn);
      if (conn.resolve) conn.resolve(conn);
    });

    conn.peer.on('error', error => {
      if (connected) return;
      if (conn.reject) conn.reject(error);
    });

    return conn;
  }

  connect(peerId, opts) {
    return new Promise((rs, rj) => {
      const connectionId = randomToken();
      this.connections[connectionId] = this.createPeer(
        connectionId,
        peerId,
        {
          ...opts,
          initiator: true,
        },
        { reject: rj, resolve: rs }
      );
    });
  }

  close() {
    this.signaler.disconnect();

    for (const id of Object.keys(this.connections)) {
      const conn = this.connections[id];
      conn.peer.destroy();
    }

    this.connections = {};
  }
}

module.exports = ConnectionManager;
