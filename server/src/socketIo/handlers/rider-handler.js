const sendTripUpdateToRider = (io, riderSocket, data) => {
    if (riderSocket) {
        io.to(riderSocket).emit('tripUpdate', data);
    }
};

module.exports = { sendTripUpdateToRider };
