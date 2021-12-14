const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 55
        },
        stars: {
            type: Number,
            required: true
        },
        opening: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        transportation: {
            type: String,
            required: true
        },
        category: {
            type: String,
            minlength: 3,
            maxlength: 55
        },
        phoneNumber: {
            type: String
        },
        mapAddress: {
            type: String
        },
        mapLatitude: {
            type: String,
            required: true
        },
        mapLongitude: {
            type: String,
            required: true
        },
        image: {
            type: String
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('hotel', hotelSchema); 