const AppError = require('../utils/app-error');
const catchAsync = require('../utils/catch-async');
const { validateUpdateTripStatus } = require('../models/trip-model');
const { getOneTrip, getFilteredTrips } = require('../services/trip-service');
const { sendTripUpdateToRider } = require('./../socketIo/handlers/rider-handler');
const { findNearbyDrivers } = require('../services/driver-info-service');
const { rideRequestToDriver } = require('./../socketIo/handlers/driver-handler');
const { getOneDriverInfo } = require('../services/driver-info-service');

const updateTripStatus = catchAsync(async (req, res, next) => {
    const { error } = validateUpdateTripStatus(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));
    const io = req.app.get('io');

    const trip = await getOneTrip({ _id: req.params.trip_id });
    if (!trip) return next(new AppError('Trip not found', 404));

    if (trip.driver.id.toString() !== req.user.id)
        return next(new AppError('You are not authorized to update this trip', 403));

    if (trip.status === 'canceled' || trip.status === 'completed')
        return next(new AppError('This trip has already been completed or canceled', 400));

    const driverInfo = await getOneDriverInfo({ user: req.user.id });

    // ===================================
    // trip requested
    // ===================================
    if (trip.status === 'requested') {
        // driver accepts the trip
        // =============================
        if (req.body.status === 'accepted') {
            trip.status = 'accepted';
            trip.acceptedAt = Date.now();
            await trip.save();
            driverInfo.available = false;
            await driverInfo.save();

            // console.log(trip)

            // send the message to rider
            sendTripUpdateToRider(io, trip.rider.socketId, {
                message: 'Driver Accepted the trip',
                data: trip,
            });

            return res.status(200).json({
                status: 'success',
                data: {
                    trip,
                },
            });
        }

        // driver rejects the trip
        // ==============================
        if (req.body.status === 'canceled') {
            sendTripUpdateToRider(io, trip.rider.socketId, {
                message: 'Driver cancelled the request. Finding another driver',
                data: req.user,
            });
            trip.rejectedBy.push({ driver: req.user.id });
            await trip.save();
            driverInfo.available = true;
            await driverInfo.save();

            // find another driver
            const nearbyDrivers = await findNearbyDrivers(trip.origin.coordinates, trip.rejectedBy);
            if (nearbyDrivers.length === 0) {
                sendTripUpdateToRider(io, trip.rider.socketId, {
                    message: 'No drivers found nearby. Trip cancelled',
                });
                trip.status = 'canceled';
            } else {
                rideRequestToDriver(io, trip, nearbyDrivers[0].user.socketId, trip.rejectedBy);
                trip.status = 'requested';
                trip.driver = nearbyDrivers[0].user._id;
            }
            await trip.save();
            res.status(200).json({
                status: 'success',
                data: {
                    message: 'Trip cancelled successfully',
                },
            });
        }
    }

    // =================================
    // trip Accepted
    // ===================================
    if (trip.status === 'accepted') {
        if (req.body.status === 'started') {
            trip.status = 'started';
            trip.startedAt = Date.now();
            await trip.save();
            driverInfo.available = false;
            await driverInfo.save();

            // send the message to rider
            sendTripUpdateToRider(io, trip.rider.socketId, {
                message: 'Driver has started the trip',
                data: trip,
            });

            res.status(200).json({
                status: 'success',
                data: {
                    trip,
                },
            });
        } else if (req.body.status === 'cancel') {
            trip.status = 'canceled';
            await trip.save();
            driverInfo.available = true;
            await driverInfo.save();

            // send the message to rider
            sendTripUpdateToRider(io, trip.rider.socketId, {
                message: 'Driver has canceled the trip',
                data: trip,
            });

            res.status(200).json({
                status: 'success',
                data: {
                    message: 'Trip cancelled successfully',
                },
            });
        }
    }

    // =================================
    // trip Accepted
    // ===================================
    if (trip.status === 'started') {
        if (req.body.status === 'completed') {
            trip.status = 'completed';
            trip.completedAt = Date.now();
            await trip.save();
            driverInfo.available = true;
            await driverInfo.save();

            // send the message to rider
            sendTripUpdateToRider(io, trip.rider.socketId, {
                message: 'Driver has completed the trip',
                data: trip,
            });

            res.status(200).json({
                status: 'success',
                data: {
                    trip,
                },
            });
        }
    } else {
        return next(new AppError('Invalid status', 400));
    }
});

const getMyTrips = catchAsync(async (req, res, next) => {
    const trips = await getFilteredTrips({ driver: req.user.id });
    res.status(200).json({
        status: 'success',
        results: trips.length,
        data: {
            trips,
        },
    });
});
module.exports = {
    updateTripStatus,
    getMyTrips,
};
