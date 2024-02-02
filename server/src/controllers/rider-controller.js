const AppError = require('../utils/app-error');
const { validateTrip } = require('../models/trip-model');
const { getOneUser } = require('../services/user-service');
const { findNearbyDrivers } = require('../services/driver-info-service');
const { createNewTrip, getOneTrip } = require('../services/trip-service');
const { rideRequestToDriver, rideCancelMessageToDriver } = require('./../socketIo/handlers/driver-handler');
const { sendTripUpdateToRider } = require('./../socketIo/handlers/rider-handler');
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
        driver: nearbyDrivers[0].user._id,
    });

    // send the request to the driver
    const io = req.app.get('io');
    rideRequestToDriver(io, trip, nearbyDrivers[0].user.socketId);

    // send a finding driver message to the rider
    if (req.user.socketId) {
        sendTripUpdateToRider(io, req.user.socketId, {
            message: 'Finding a driver',
        });
    }

    res.status(201).json({
        status: 'success',
        data: {
            message: 'Searching for nearby riders',
        },
    });
});

const cancelRideRequest = catchAsync(async (req, res, next) => {
    const tripId = req.params.trip_id;
    const trip = await getOneTrip({ id: tripId });
    if (!trip) return next(new AppError('Trip not found', 404));

    if (trip.rider.toString() !== req.user.id)
        return next(new AppError('You are not authorized to cancel this trip', 403));

    if (trip.status === 'canceled' || trip.status === 'completed' || trip.status === 'started')
        return next(new AppError('This trip has already been completed or started or canceled', 400));

    trip.status = 'canceled';
    await trip.save();

    const driver = await getOneUser({ id: trip.driver });
    const io = req.app.get('io');
    if (driver.socketId) {
        rideCancelMessageToDriver(io, trip, driver.socketId);
    }
    res.status(200).json({
        status: 'success',
        data: {
            trip,
        },
    });
});
module.exports = {
    createRideRequest,
    cancelRideRequest,
};
