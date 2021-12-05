const NotifModel = require('../models/notif.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');

module.exports.allNotif = (req, res) => {
    NotifModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}