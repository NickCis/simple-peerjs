const { EventEmitter } = require('eventemitter3');
const Peer = require('simple-peer');
const Signaler = require('./Signaler');
const { randomToken } = require('./util');
const { PeerEventType, PeerErrorType } = require('./constants');

class ConnectionManager extends EventEmitter {
  constructor(opts) {
    super();
    this.options = opts;
    this.connections = {};
    this.signaler = new Signaler(opts);
    this.id = new Promise(rs => {
      this.signaler.on(PeerEventType.Open, rs);
    });

    this.signaler.on(PeerEventType.Signal, ({ peer: peerId, id, signal }) => {
      let conn = this.connections[id];

      if (!peer) {
        conn.peer = this.connections[id] = this.createPeer(id, peerId);
        conn.peer.on('connect', () => {
          this.emit('connect', conn);
        });
      }

      conn.peer.signal(signal);
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
    return {
      ...extra,
      id,
      peerId,
      peer: new Peer({
        ...opts,
        wrtc: this.options.wrtc,
      }),
    };
  }

  connect(peerId, opts) {
    return new Promise((rs, rj) => {
      // TODO: manage couldn't connect messages!
      // TODO: managed disconnected
      const connectionId = randomToken();
      const conn = (this.connections[connectionId] = this.createPeer(
        connectionId,
        peerId,
        {
          ...opts,
          initiator: true,
        },
        { reject: rj }
      ));
      const handlePeerSignal = data => {
        this.signaler.signal(peerId, data, connectionId);
      };
      const handleConnect = () => {
        conn.peer.removeListener('signal', handlePeerSignal);
        conn.peer.removeListener('connect', handleConnect);
        rs(conn);
      };

      conn.peer.on('signal', handlePeerSignal);
      conn.peer.on('connect', handleConnect);
    });
  }
}

module.exports = ConnectionManager;
