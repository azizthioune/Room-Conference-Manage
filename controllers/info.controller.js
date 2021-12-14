const infoModel = require('../models/info.model');
const UserModel = require('../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/error.utils');
const pipeline = promisify(require('stream').pipeline);

module.exports.allInfos = (req, res) => {
    infoModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}

module.exports.infoDetails = async (req, res) => {
    console.log(req.params);
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknown :' + req.params.id)
    }
    infoModel.findById(req.params.id, (err, docs) => {
        if (!err) {
            res.send(docs)
        } else {
            console.log('ID unknown :' + err);
        }
    });
}

module.exports.createInfo = async (req, res) => {

    const newInfo = new infoModel({
        posterId: req.body.posterId,
        name: req.body.name,
        info: req.body.info
    });

    try {
        const info = await newInfo.save();
        return res.status(201).json(info);
    } catch (err) {
        return res.status(400).send(err);
    }

};

module.exports.updateInfo = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    const updatedRecord = {
        name: req.body.name,
        info: req.body.info
    }

    infoModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error:", err);
        }
    )

};

module.exports.deleteInfo = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    infoModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("Delete failed :", err);
        }
    )

};