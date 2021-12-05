const ActuModel = require('../models/actu.model');
const UserModel = require('../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/error.utils');
const pipeline = promisify(require('stream').pipeline);


module.exports.allActu = (req, res) => {
    ActuModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}

module.exports.actuInfo = async (req, res) => {
    console.log(req.params);
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknown :' + req.params.id)
    }
    ActuModel.findById(req.params.id, (err, docs) => {
        if (!err) {
            res.send(docs)
        } else {
            console.log('ID unknown :' + err);
        }
    });
}

module.exports.createActu = async (req, res) => {

    let fileName;

    if (req.file !== null) {
        try {
            if (
                req.file.detectedMimeType !== "image/jpg" &&
                req.file.detectedMimeType !== "image/png" &&
                req.file.detectedMimeType !== "image/jpeg"
            )
                throw Error("invalid file");

            if (req.file.size > 2000000)
                throw Error("max size");

        } catch (err) {
            const errors = uploadErrors(err)
            return res.status(400).json({ errors });
        }

        fileName = req.body.articleName + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/actus/${fileName}`
            )
        );
    }

    const newActu = new ActuModel({
        posterId: req.body.posterId,
        articleName: req.body.articleName,
        articleDescription: req.body.articleDescription,
        articleText: req.body.articleText,
        category: req.body.category,
        date: req.body.date,
        auteurMail: req.body.auteurMail,
        auteurFacebook: req.body.auteurFacebook,
        auteurTwitter: req.body.auteurTwitter,
        image: req.file !== null ? "./uploads/actus/" + fileName : ""
    });

    try {
        const actu = await newActu.save();
        return res.status(201).json(actu);
    } catch (err) {
        return res.status(400).send(err);
    }

};

module.exports.updateActu = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    const updatedRecord = {
        articleName: req.body.articleName,
        articleDescription: req.body.articleDescription,
        articleText: req.body.articleText,
        category: req.body.category,
        date: req.body.date,
        auteurMail: req.body.auteurMail,
        auteurFacebook: req.body.auteurFacebook,
        auteurTwitter: req.body.auteurTwitter,
    }

    ActuModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error:", err);
        }
    )

};

module.exports.deleteActu = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    ActuModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("Delete failed :", err);
        }
    )

};