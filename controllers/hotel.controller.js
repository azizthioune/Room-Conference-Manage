const HotelModel = require('../models/hotel.model');
const UserModel = require('../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/error.utils');
const pipeline = promisify(require('stream').pipeline);

module.exports.allHotels = (req, res) => {
    HotelModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}

module.exports.hotelInfo = async (req, res) => {
    console.log(req.params);
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknown :' + req.params.id)
    }
    HotelModel.findById(req.params.id, (err, docs) => {
        if (!err) {
            res.send(docs)
        } else {
            console.log('ID unknown :' + err);
        }
    });
}

module.exports.createHotel = async (req, res) => {

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

        fileName = req.body.name + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/hotels/${fileName}`
            )
        );
    }

    const newHotel = new HotelModel({
        posterId: req.body.posterId,
        name: req.body.name,
        stars: req.body.stars,
        opening: req.body.opening,
        description: req.body.description,
        category: req.body.category,
        phoneNumber: req.body.phoneNumber,
        mapAddress: req.body.mapAddress,
        mapLatitude: req.body.latitude,
        mapLongitude: req.body.longitude,
        image: req.file !== null ? "./uploads/hotels/" + fileName : ""
    });

    try {
        const hotel = await newHotel.save();
        return res.status(201).json(hotel);
    } catch (err) {
        return res.status(400).send(err);
    }

};

module.exports.updateHotel = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    const updatedRecord = {
        name: req.body.name,
        stars: req.body.stars,
        opening: req.body.opening,
        description: req.body.description,
        category: req.body.category,
        phoneNumber: req.body.phoneNumber,
        mapAddress: req.body.mapAddress,
        mapLatitude: req.body.latitude,
        mapLongitude: req.body.longitude,
    }

    HotelModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("update error:", err);
        }
    )

};

module.exports.deleteHotel = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    HotelModel.findByIdAndRemove(
        req.params.id,
        (err, docs) => {
            if (!err) res.send(docs);
            else console.log("Delete failed :", err);
        }
    )

};