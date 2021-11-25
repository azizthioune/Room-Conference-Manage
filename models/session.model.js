const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
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
        type: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 55
        },
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        },
        category: {
            type: String,
            minlength: 3,
            maxlength: 55
        },
        sessionLink: {
            type: String
        },
        address: {
            type: String
        },
        description: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 55
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
        likers: {
            type: [String],
            required: true
        },
        speakers: {
            type: [
                {
                    firstname: String,
                    lastname: String,
                    image: String,
                    email: String,
                    fonction: String,
                    linkedIn: String,
                    instagram: String,
                    twitter: String,
                    web: String,
                }
            ],
            required: true
        },
        moderators: {
            type: [
                {
                    firstname: String,
                    lastname: String,
                    fonction: String
                }
            ],
            required: true
        },
        files: {
            type: [
                {
                    fileId: String,
                    fileName: String,
                    fileLink: String
                }
            ],
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('session', sessionSchema); 