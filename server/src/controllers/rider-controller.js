const AppError = require('../utils/app-error');
const { validateTrip } = require('../models/trip-model');
const { findNearbyDrivers } = require('../services/driver-info-service');
const catchAsync = require('../utils/catch-async');

const createRideRequest = catchAsync(async (req, res, next) => {
    const { error } = validateTrip(req.body);
    if (error) return next(new AppError(error.details[0].message, 400));

    const nearbyDrivers = await findNearbyDrivers(req.body.origin.coordinates);
    res.status(201).json({ nearbyDrivers });
});

module.exports = {
    createRideRequest,
};
