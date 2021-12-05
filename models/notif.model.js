const mongoose = require('mongoose');

const notifSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        sessionName: {
            type: String,
            required: true
        },
        sessionCategory: {
            type: String,
            required: true
        },
        isOpen: {
            type: Boolean
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('notif', notifSchema); 