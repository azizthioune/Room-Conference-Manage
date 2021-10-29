const SessionModel = require('../models/session.model');
const UserModel = require('../models/session.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/error.utils');
const pipeline = promisify(require('stream').pipeline);

module.exports.readSession = (req, res) => {
    SessionModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}

module.exports.createSession = (req, res) => {

    let fileName;

    if (req.file !== null) {
        try {
            if (
                req.file.detectedMimeType !== "image/jpg" &&
                req.file.detectedMimeType !== "image/png" &&
                req.file.detectedMimeType !== "image/jpeg"
            )
                throw Error("invalid file");

            if (req.file.size > 500000)
                throw Error("max size");

        } catch (err) {
            const errors = uploadErrors(err)
            return res.status(400).json({ errors });
        }

        fileName = req.body.posterId + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/posts/${fileName}`
            )
        );
    }

    const newSession = new SessionModel({
        posterId: req.body.posterId,
        name: req.body.name,
        type: req.body.type,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        category: req.body.category,
        sessionLink: req.body.sessionLink,
        address: req.body.address,
        description: req.body.description,
        mapAddress: req.body.mapAddress,
        image: req.file !== null ? "./uploads/sessions/" + fileName : "",
        likers: [],
        speakers: [],
        moderators: [],
        files: []
    });

    try {
        const session = await newSession.save();
        return res.status(201).json(session);
    } catch (err) {
        return res.status(400).send(err);
    }

};

module.exports.updateSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    const updatedRecord = {
        name: req.body.name,
        type: req.body.type,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        category: req.body.category,
        sessionLink: req.body.sessionLink,
        address: req.body.address,
        description: req.body.description,
        mapAddress: req.body.mapAddress,
    }

    SessionModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error:", err);
        }
    )

};

module.exports.deleteSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    SessionModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("Delete failed :", err);
        }
    )

};

module.exports.likeSession = (req, res) => {

}

module.exports.unlikeSession = (req, res) => {

}

module.exports.addSpeakerSession = (req, res) => {

}

module.exports.editSpeakerSession = (req, res) => {

}

module.exports.deleteSpeakerSession = (req, res) => {

}


