const { DriverInfo } = require('../models/driver-info-model');

const getAllDriverInfos = () => {
    return DriverInfo.find();
};

const getOneDriverInfo = (filter) => {
    return Driver;
};

const createNewDriverInfo = (payload) => {
    const driverInfo = new DriverInfo(payload);

    return driverInfo.save();
};

const updateOneDriverInfo = (filter, payload) => {
    return DriverInfo.findOneAndUpdate;
};

const deleteOneDriverInfo = (filter) => {
    return DriverInfo.findOneAndDelete;
};

module.exports = {
    getAllDriverInfos,
    getOneDriverInfo,
    createNewDriverInfo,
    updateOneDriverInfo,
    deleteOneDriverInfo,
};
