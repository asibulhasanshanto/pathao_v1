const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const tripSchema = new Schema(
    {
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rider: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        origin: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
        },
        destination: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
        },
        status: {
            type: String,
            enum: ['requested', 'accepted', 'started', 'completed', 'canceled'],
            default: 'requested',
        },
        rejectedBy: [
            {
                driver: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);
