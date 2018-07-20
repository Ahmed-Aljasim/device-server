const net = require('net');
const express = require('express');
const socket = require('socket.io');

// class payload {
//   constructor(data) { this.data = data }

//   getData() { return this.data; }
//   addData(data) { this.data = data; }
// }

// let z = new payload('', '');

let decodedData = {};
let data = '';

function GPS(i) {
  let c = i + 39;
  let a = 0;

  decodedData.gpsStatus = data.substring(c, c + 1);
  c += 2;

  decodedData.lat = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.lat += data[k];
  }

  decodedData.long = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.long += data[k];
  }

  decodedData.gpsSpeed = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.gpsSpeed += data[k];
  }

  decodedData.gpsAngle = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.gpsAngle += data[k];
  }

  decodedData.HDOP = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ',' || data[k] === '#') break;
    c++;
    decodedData.HDOP += data[k];
  }

  return c + a;
}

function LBS(i) {
  let c = i + 39;
  let a = 0;

  decodedData.MCC = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.MCC += data[k];
  }

  decodedData.MNC = '';
  for (k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.MNC += data[k];
  }

  decodedData.LAC = '';
  for (k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.LAC += data[k];
  }

  decodedData.CID = '';
  for (k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.CID += data[k];
  }

  decodedData.db = '';
  for (k = c + a; k < k + 5; k++) {
    if (data[k] === ',' || data[k] === '#') break;
    c++;
    decodedData.db += data[k];
  }

  return c + a;
}

function STT(i) {
  let c = i + 5;
  let a = 0;

  decodedData.deviceStatus = '';
  for (let k = c + a; k < k + 5; k++) {
    if (data[k] === ';') { a++; break; }
    c++;
    decodedData.deviceStatus += data[k];
  }

  decodedData.alarmTriggered = '';
  for (k = c + a; k < k + 5; k++) {
    if (data[k] === ',' || data[k] === '#') break;
    c++;
    decodedData.alarmTriggered += data[k];
  }

  return c + a;
}

const port2 = 4000;
const server2 = express().listen(port2, () => console.log(`Listening for requests on port ${port2}`));

const io = socket(server2);

const server1 = net.createServer();

server1.on("connection", socket => {

  console.log(`Connection open ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', inData => {
    // z.addData(`${data}`);
    data = `${inData}`;

    for (let i = 0; i < data.length; i++) {
      // Packet header: *TS01
      if (data[i] === '*') {
        decodedData.deviceId = data.substring(i + 6, i + 21);
        decodedData.hour = data.substring(i + 22, i + 24);
        decodedData.min = data.substring(i + 24, i + 26);
        decodedData.sec = data.substring(i + 26, i + 28);
        decodedData.day = data.substring(i + 28, i + 30);
        decodedData.month = data.substring(i + 30, i + 32);
        decodedData.year = data.substring(i + 32, i + 34);

        let c;
        // GPS or LBS
        if (data.substring(i + 35, i + 38) === 'GPS') c = GPS(i);
        else if (data.substring(i + 35, i + 38) === 'LBS') c = LBS(i);
        // STT
        if (data.substring(c + 1, c + 4) === 'STT') c = STT(c);
        // # Packet footer: #
        // TODO: set i to the next packet to avoid empty loops
        // Reset object
        io.sockets.emit('chat', decodedData);
        decodedData = {};
      }
    }

    // parse the data

    // send it to the client
    // io.sockets.emit('chat', z.getData());

    // save to the db

  });

  socket.on('error', err => console.log('Error'));

  socket.once('close', () => {
    console.log(`Connection closed ${socket.remoteAddress}:${socket.remotePort}`);
  });

});

const port1 = 9000;
server1.listen(port1, () => console.log(`Server listening on port ${port1}`));