const mongoose = require('mongoose');

const infoSchema = new mongoose.Schema(
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
        info: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 55
        },
        image: {
            type: String
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('info', infoSchema); 