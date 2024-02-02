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

module.exports = {
    getAllDriverInfos,
    getOneDriverInfo,
    createNewDriverInfo,
    updateOneDriverInfo,
    deleteOneDriverInfo,
};
