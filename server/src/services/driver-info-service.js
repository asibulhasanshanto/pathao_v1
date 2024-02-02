const mongoose = require('mongoose');
const { DriverInfo } = require('../models/driver-info-model');

const getAllDriverInfos = () => {
    return DriverInfo.find();
};

const getOneDriverInfo = (filter) => {
    return DriverInfo.findOne(filter);
};

const createNewDriverInfo = (payload) => {
    const driverInfo = new DriverInfo(payload);

    return driverInfo.save();
};

const updateOneDriverInfo = (filter, payload) => {
    return DriverInfo.findOneAndUpdate(filter, payload, { new: true });
};

const deleteOneDriverInfo = (filter) => {
    return DriverInfo.findOneAndDelete(filter);
};

const findNearbyDrivers = async (origin, rejectedDrivers = []) => {
    const [lan, lat] = origin;

    const nearbyDrivers = await DriverInfo.aggregate([
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [Number(lat), Number(lan)] },
                distanceField: 'distance',
                maxDistance: 5000,
                spherical: true,
            },
        },
        // filter out the rejected drivers
        {
            $match: {
                // users id shoudl not be present in rejectedDrivers
                user: { $nin: rejectedDrivers.map((driver) => new mongoose.Types.ObjectId(driver?.driver)) },
                available: true,
                active: true,
            },
        },
        // populate user info
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
            },
        },
        { $unwind: '$user' },
        // select info
        {
            $project: {
                'user.role': 0,
                'user.__v': 0,
                'user.createdAt': 0,
                'user.updatedAt': 0,
                // 'user.socketId': 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            },
        },

        // order by desc
        { $sort: { distance: 1 } },

        // get the first one only
        {
            $limit: 1,
        },
    ]);

    return nearbyDrivers;
};

module.exports = {
    getAllDriverInfos,
    getOneDriverInfo,
    createNewDriverInfo,
    updateOneDriverInfo,
    deleteOneDriverInfo,
    findNearbyDrivers,
};
