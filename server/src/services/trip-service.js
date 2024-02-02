const { Trip } = require('../models/trip-model');

const getAllTrips = () => {
    return Trip.find();
};

const getOneTrip = (filter) => {
    return Trip.findOne(filter);
};

const createNewTrip = (payload) => {
    const trip = new Trip(payload);

    return trip.save();
};

const updateOneTrip = (filter, payload) => {
    return Trip.findOneAndUpdate(filter, payload, { new: true });
};

const deleteOneTrip = (filter) => {
    return Trip.findOneAndDelete(filter);
};

module.exports = {
    getAllTrips,
    getOneTrip,
    createNewTrip,
    updateOneTrip,
    deleteOneTrip,
};
