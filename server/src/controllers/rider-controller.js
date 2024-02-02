const AppError = require('../utils/app-error');
const { validateTrip } = require('../models/trip-model');
const { findNearbyDrivers } = require('../services/driver-info-service');
const { createNewTrip } = require('../services/trip-service');
const { rideRequestToDriver } = require('./../socketIo/handlers/driver-handler');
const catchAsync = require('../utils/catch-async');

const createRideRequest = catchAsync(async (req, res, next) => {
    const { error } = validateTrip(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const nearbyDrivers = await findNearbyDrivers(req.body.origin.coordinates);
    if (nearbyDrivers.length === 0) return next(new AppError('No drivers found nearby', 404));

    // create a trip
    const trip = await createNewTrip({
        rider: req.user.id,
        origin: req.body.origin,
        destination: req.body.destination,
    });

    // send the request to the driver
    const io = req.app.get('io');
    // console.log(io);
    rideRequestToDriver(trip, nearbyDrivers[0].user.socketId,io);

    // console.log(trip, nearbyDrivers);
    res.status(201).json({
        status: 'success',
        data: {
            message: 'Searching for nearby riders',
        },
    });
});

module.exports = {
    createRideRequest,
};
