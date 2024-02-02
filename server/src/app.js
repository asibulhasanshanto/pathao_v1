const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const { initializeSocketIo } = require('./socketIo');
const { authenticate } = require('./middlewares/auth-socket-middleware');
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        credentials: true,
    },
});

app.set('io', io);
require('./startup/global-middleware')(app);
require('./startup/routes')(app);

io.use(authenticate);
initializeSocketIo(io);


module.exports = { app, httpServer, io };
