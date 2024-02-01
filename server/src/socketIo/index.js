const { Server, Socket } = require('socket.io');
const tokenService = require('./../services/token-service');
const { getOneUser } = require('./../services/user-service');
const { merge, get } = require('lodash');
const jwt = require('jsonwebtoken');

const onConnection = async (socket) => {
    try {
        
        socket.on('disconnect', async () => {
            socket.user.socketId = null;
            const user = await socket.user.save({ validateBeforeSave: false });
            
        });
        console.log('connected');
    } catch (error) {
        socket.emit('error', error?.message || 'Something went wrong while connecting to the socket.');
    }
};

const initializeSocketIo = async (io) => {
    return io
        .use(async function (socket, next) {
            if (socket.handshake.headers?.authorization && socket.handshake.headers?.authorization) {
                
                try {
                    const decoded = await tokenService.verifyJwtToken(socket.handshake.headers?.authorization);
                    const user = await getOneUser({ id: decoded._id });
                    user.socketId = socket.id;
                    await user.save({ validateBeforeSave: false });
                    socket.user = user;
                    next();
                } catch (error) {
                    // console.log(error);
                    return next(new Error('Authentication error'));
                }
            } else {
                next(new Error('Authentication error'));
            }
        })
        .on('connection', onConnection);
};

module.exports = { initializeSocketIo };
