const tokenService = require('../services/token-service');
const { getOneUser } = require('../services/user-service');
const { getOneDriverInfo, createNewDriverInfo } = require('../services/driver-info-service');

const authenticate = async function (socket, next) {
    if (socket.handshake.headers?.authorization && socket.handshake.headers?.authorization) {
        try {
            const decoded = await tokenService.verifyJwtToken(socket.handshake.headers?.authorization);
            // add the socket id to the user
            const user = await getOneUser({ _id: decoded.id });
            user.socketId = socket.id;
            await user.save({ validateBeforeSave: false });
            socket.user = user;

            // make the driver online
            if (user.role === 'driver') {
                var driverInfo = await getOneDriverInfo({ user: user.id });
                // console.log(driverInfo, user.id);
                if (driverInfo) {
                    driverInfo.active = true;
                    await driverInfo.save({ validateBeforeSave: false });
                } else {
                    driverInfo = await createNewDriverInfo({
                        user: user.id,
                        active: true,
                    });
                }
            }
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
