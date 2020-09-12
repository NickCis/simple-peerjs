import SimplePeerJs from 'simple-peerjs';

async function main() {
  const code = document.querySelector('code');
  console.log(code);
  const peer = new SimplePeerJs({
    secure: true,
  });

  peer.on('connect', conn => {
    code.innerHTML += `peer: new connection from ${conn.peerId}\n`;
    conn.peer.on('data', data => {
      code.innerHTML += `initiator -> peer: ${data.toString()}\n`;
    });

    conn.peer.send('Hi Initiator, how are you?');
  });
  const peerId = await peer.id;

  code.innerHTML += `peer: ${peerId}\n`;

  const initiator = new SimplePeerJs({
    secure: true,
  });
  const initiatorId = await initiator.id;

  code.innerHTML += `initiator: ${initiatorId}\n`;
  code.innerHTML += `initiator -> peer connection...`;
  const initiatorConnection = await initiator.connect(peerId);
  code.innerHTML += `✅\n`;

  initiatorConnection.peer.on('data', data => {
    code.innerHTML += `peer -> initiator: ${data.toString()}\n`;
    initiatorConnection.peer.send('Fine! :)');
  });
}

main();
