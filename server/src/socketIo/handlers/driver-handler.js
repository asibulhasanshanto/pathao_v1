const { getOneDriverInfo, createNewDriverInfo, updateOneDriverInfo } = require('../../services/driver-info-service');
const driverHandler = (socket) => {
    socket.on('driverLocationPing', async (location) => {
        try {
            // console.log(location);
            if (socket.user.role !== 'driver') {
                return socket.emit('error', 'You are not a driver.');
            } else {
                const [lan, lat] = location.location.split(',');
                // console.log(latLang);
                const driverInfo = await getOneDriverInfo({ user: socket.user._id });
                if (driverInfo) {
                    await updateOneDriverInfo(
                        { user: socket.user._id },
                        { currentLocation: { type: 'Point', coordinates: [Number(lat), Number(lan)] } }
                    );
                } else {
                    await createNewDriverInfo({
                        user: socket.user._id,
                        currentLocation: { type: 'Point', coordinates: [Number(lat), Number(lan)] },
                    });
                }
            }
            // console.log('driverLocation', location);
            // socket.to('driver').emit('driverLocation', { driverId: socket.user._id, location });
        } catch (error) {
            socket.emit('error', error?.message || 'Something went wrong while connecting to the socket.');
        }
    });
};

module.exports = { driverHandler };

//25.498384, 88.964789
