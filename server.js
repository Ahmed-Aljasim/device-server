const net = require('net');
const express = require('express');
const socket = require('socket.io');

class payload {
  constructor(data) { this.data = data }

  getData() { return this.data; }
  addData(data) { this.data = data; }
}

let z = new payload('', '');

const port2 = 443;
const server2 = express().listen(port2, () => console.log(`Listening for requests on port ${port2}`));

const io = socket(server2);

const server1 = net.createServer();

server1.on("connection", socket => {

  console.log(`Connection open ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', data => {
    z.addData(`${data}`);
    io.sockets.emit('chat', z.getData());
  });

  socket.on('error', err => console.log('Error'));

  socket.once('close', () => {
    console.log(`Connection closed ${socket.remoteAddress}:${socket.remotePort}`);
  });

});

const port1 = 9000;
server1.listen(port1, () => console.log(`Server listening on port ${port1}`));