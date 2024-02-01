const { getOneDriverInfo, createNewDriverInfo, updateOneDriverInfo } = require('../../services/driver-info-service');
const driverHandler = (socket) => {
    socket.on('driverLocation', async (location) => {
        try {
            console.log(socket.user);
            if (socket.user.role !== 'driver') {
                return socket.emit('error', 'You are not a driver.');
            }
            // console.log('driverLocation', location);
            // socket.to('driver').emit('driverLocation', { driverId: socket.user._id, location });
        } catch (error) {
            socket.emit('error', error?.message || 'Something went wrong while connecting to the socket.');
        }
    });
};

module.exports = { driverHandler };
