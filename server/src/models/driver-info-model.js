const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const driverInfoSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        active: {
            type: Boolean,
            default: false,
        },
        available: {
            type: Boolean,
            default: true,
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: [Number],
        },
    },
    {
        timestamps: true,
    }
);
driverInfoSchema.index({ currentLocation: '2dsphere' });
const DriverInfo = model('DriverInfo', driverInfoSchema);

module.exports = {
    DriverInfo,
};
