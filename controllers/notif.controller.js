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

module.exports.updateNotif = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    const updatedRecord = {
        isOpen: req.body.isOpen
    }

    NotifModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error:", err);
        }
    )

};