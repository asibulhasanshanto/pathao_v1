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
            default: false,
        },
        currentLocation: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

const DriverInfo = model('DriverInfo', driverInfoSchema);

module.exports = {
    DriverInfo,
};
