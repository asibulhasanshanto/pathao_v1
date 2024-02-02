const mongoose = require('mongoose');
const { Schema, model } = mongoose;
const Joi = require('joi');


const tripSchema = new Schema(
    {
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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

tripSchema.index({ origin: '2dsphere' });
tripSchema.index({ destination: '2dsphere' });

const validateTrip = (trip)=>{
    const schema = Joi.object({
        driver: Joi.string(),
        rider: Joi.string(),
        origin: Joi.object({
            coordinates: Joi.array().items(Joi.number()).required(),
            address: Joi.string().required(),
            type: Joi.string().valid('Point').required(),
        }).required(),
        destination: Joi.object({
            coordinates: Joi.array().items(Joi.number()).required(),
            address: Joi.string().required(),
            type: Joi.string().valid('Point').required(),
        }).required(),
    });
    return schema.validate(trip);
}

const Trip = model('Trip', tripSchema);

module.exports = {
    Trip,
    validateTrip
};
