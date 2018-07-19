const net = require('net');

const server = net.createServer();

server.on("connection", socket => {

  console.log(`Connection open ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', data => {
    console.log('%s', data);
  });

  socket.on('error', err => console.log('Error'));

  socket.once('close', () => {
    console.log(`Connection closed ${socket.remoteAddress}:${socket.remotePort}`);
  });
  
});

const port = 9000;
server.listen(port, () => console.log(`Server listening on port ${port}`));