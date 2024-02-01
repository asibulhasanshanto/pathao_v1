const { Server, Socket } = require('socket.io');
const { verifyJwtToken } = require('./../services/token-service');
const onConnection = async (socket) => {
    try {
        // const token = socket.handshake.auth?.token;
        // get the token from headers
        const token = socket.handshake.headers?.authorization?.split(' ')[1];
        console.log(token);

        socket.on('disconnect', () => {
            console.log('user has disconnected 🚫.');
            // console the socketid
            console.log(socket.id);
        });
    } catch (error) {
        socket.emit('error', error?.message || 'Something went wrong while connecting to the socket.');
    }
};

const initializeSocketIo = (io) => {
    return io.on('connection', onConnection);
};

module.exports = { initializeSocketIo };
