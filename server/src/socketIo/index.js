const tokenService = require('./../services/token-service');
const { getOneUser } = require('./../services/user-service');
const { driverHandler } = require('./handlers/driver-handler');
const onConnection = async (socket) => {
    try {
        driverHandler(socket);
        socket.on('disconnect', async () => {
            var user = socket.user;
            user.socketId = null;
            user = await user.save({ validateBeforeSave: false });
            socket.user = null;
            console.log(socket.user);

            // disconnect the user from the socket
            // socket.disconnect();
        });
    } catch (error) {
        socket.emit('error', error?.message || 'Something went wrong while connecting to the socket.');
    }
};

const initializeSocketIo = async (io) => {
    // authenticate the user with jwt token and set the user to the socket
    return io.on('connection', onConnection);
};

module.exports = { initializeSocketIo };
