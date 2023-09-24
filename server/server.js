const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {cors: {
  origin: 'http://localhost:3000'
}});
const { randomUUID } = require('crypto');

const users = new Map();

io.on('connection', (socket) => {
  let username = socket.handshake.auth.username;

  console.log('a user connected');

  users.set(socket.id, username);

  io.emit('receiveNewUser', username, Object.fromEntries(users));

  socket.on('sendMessage', (message) => {
    const username = users.get(socket.id);
    io.emit('receiveMessage', randomUUID(), username, socket.id, message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.delete(socket.id);
  });
});

server.listen(8080, () => {
  console.log('listening on *:8080');
});