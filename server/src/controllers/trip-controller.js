const AppError = require('./../utils/app-error');
const catchAsync = require('./../utils/catch-async');
const { getFilteredTrips, getOneTrip } = require('../services/trip-service');

const getAllTrips = catchAsync(async (req, res, next) => {
    // get those trips where the driver or the rider is the req.user.id
    const userId = req.user.id;
    const trips = await getFilteredTrips({ $or: [{ driver: userId }, { rider: userId }] });

    res.status(200).json({
        status: 'success',
        results: trips.length,
        data: {
            trips,
        },
    });
});

const getSingleTrip = catchAsync(async (req, res, next) => {
    const trip = await getOneTrip({ _id: req.params.trip_id, $or: [{ driver: req.user.id }, { rider: req.user.id }] });

    if (!trip) {
        return next(new AppError('No trip found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            trip,
        },
    });
});

module.exports = {
    getAllTrips,
    getSingleTrip,
};
