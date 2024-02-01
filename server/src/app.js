const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { initializeSocketIo } = require('./socketIo');

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        credentials: true,
    },
});

require('./startup/global-middleware')(app);
require('./startup/routes')(app);
initializeSocketIo(io);

module.exports = { app, httpServer, io };
