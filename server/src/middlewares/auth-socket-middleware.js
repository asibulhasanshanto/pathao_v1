const tokenService = require('../services/token-service');
const { getOneUser } = require('../services/user-service');

const authenticate = async function (socket, next) {
    if (socket.handshake.headers?.authorization && socket.handshake.headers?.authorization) {
        try {
            const decoded = await tokenService.verifyJwtToken(socket.handshake.headers?.authorization);
            const user = await getOneUser({ _id: decoded.id });
            // console.log(decoded.id, user);
            user.socketId = socket.id;
            await user.save({ validateBeforeSave: false });
            socket.user = user;
            // console.log('socket.user', user);
            next();
        } catch (error) {
            // console.log(error);
            return next(new Error('Authentication error'));
        }
    } else {
        next(new Error('Authentication error'));
    }
};

module.exports = { authenticate };
