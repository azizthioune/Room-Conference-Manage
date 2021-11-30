const mongoose = require('mongoose');

const actuSchema = new mongoose.Schema(
    {
        posterId: {
            type: String,
            required: true
        },
        articleName: {
            type: String,
            required: true,
            minlength: 3,
        },
        articleDescription: {
            type: String,
            required: true,
            minlength: 3
        },
        articleText: {
            type: String,
            required: true,
            minlength: 3,
        },
        date: {
            type: String,
            required: true
        },
        category: {
            type: String,
            minlength: 3,
            maxlength: 55
        },
        image: {
            type: String
        },
        auteurMail: {
            type: String,
            required: true
        },
        auteurFacebook: {
            type: String,
            required: true
        },
        auteurTwitter: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);
module.exports = mongoose.model('actu', actuSchema); 