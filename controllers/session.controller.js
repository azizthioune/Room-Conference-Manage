const SessionModel = require('../models/session.model');
const UserModel = require('../models/user.model');
const NotifModel = require('../models/notif.model');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');
const { promisify } = require('util');
const { uploadErrors } = require('../utils/error.utils');
const pipeline = promisify(require('stream').pipeline);
const { Expo } = require("expo-server-sdk");
const expo = new Expo();

module.exports.allSessions = (req, res) => {
    SessionModel.find((err, docs) => {
        if (!err) res.send(docs);
        else console.log("cannot get data", err);
    }).sort({ createdAt: 1 })
}

module.exports.sessionInfo = async (req, res) => {
    console.log(req.params);
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send('ID unknown :' + req.params.id)
    }
    SessionModel.findById(req.params.id, (err, docs) => {
        if (!err) {
            res.send(docs)
        } else {
            console.log('ID unknown :' + err);
        }
    });
}

module.exports.createSession = async (req, res) => {

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

        fileName = req.body.posterId + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/sessions/${fileName}`
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
        mapLatitude: req.body.latitude,
        mapLongitude: req.body.longitude,
        image: req.file !== null ? "./uploads/sessions/" + fileName : "",
        likers: [],
        speakers: [],
        moderators: [],
        files: [],
        sessionImages: [],
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

    const usersExpoToken= []
    const notifications = [];
    UserModel.find().then(data => {
        console.log("all users:")
        console.log(data);
        data.forEach((e, index) => {
            if (e.expoToken != null) {
                usersExpoToken.push(e.expoToken);
            }
            });
    } )
    
    const handlePushTokens = ( body ) => {
        
        let savedPushTokens= usersExpoToken
        for (let pushToken of savedPushTokens) {
            if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
            }
        
            notifications.push({
            to: pushToken,
            sound: "default",
            title: "Session updated",
            body: body,
            // data: { body }
            });
        }
        console.log("notif", notifications[0]);
        let chunks = expo.chunkPushNotifications(notifications);
        
        (async () => {
            for (let chunk of chunks) {
            try {
                let receipts = await expo.sendPushNotificationsAsync(chunk);
                console.log(receipts);
            } catch (error) {
                console.error(error);
            }
            }
        })();
        };

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
        mapLatitude: req.body.latitude,
        mapLongitude: req.body.longitude,
    }
    
    SessionModel.findByIdAndUpdate(
        req.params.id,
        { $set: updatedRecord },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, docs) => {
            if ((!err)) {
                res.send(docs),
                handlePushTokens(`Heey the session ${docs.name} has been updated go check it !`)


                const newNotif= new NotifModel({
                    title: notifications[0].title,
                    body: notifications[0].body,
                    sessionName: docs.name,
                    sessionCategory: docs.category,
                    isOpen: false
                });
            
                try {
                    const notif =  newNotif.save();
                    console.log(notif);
                } catch (err) {
                    console.log(err);
                }


            } else {
                console.log("update error:", err)
            }
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
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.id) ) 
        return res.status(400).send('ID unknown');


    try {
        SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $addToSet: {likers: req.body.id}
            },
            { new: true},
            (err, docs) => {
                if (err) return res.status(400).send(err);
            }
        );
        UserModel.findByIdAndUpdate(
            req.body.id,
            { 
                $addToSet: {favorites : req.params.id}
            },
            { new: true},
            (err, docs) => {
                console.log(req.params.id);
                if (!err) res.send(docs);
                else return res.status(400).send(err);
            }
        )
    } catch (err) {
        return res.status(400).send(err);
    }

}

module.exports.unlikeSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.body.id) ) 
        return res.status(400).send('ID unknown');

    try {
        SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {likers: req.body.id}
            },
            { new: true},
            (err, docs) => {
                if (err) return res.status(400).send(err);
            }
        );
        UserModel.findByIdAndUpdate(
            req.body.id,
            { 
                $pull: {favorites : req.params.id}
            },
            { new: true},
            (err, docs) => {
                console.log(req.params.id);
                if (!err) res.send(docs);
                else return res.status(400).send(err);
            }
        )
    } catch (err) {
        return res.status(400).send(err);
    }
}

module.exports.addSpeakerSession = async (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

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

        fileName = req.body.firstname + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/speakers/${fileName}`
            )
        );
    }

    try {
        SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    speakers: {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        fonction: req.body.fonction,
                        linkedIn: req.body.linkedIn,
                        instagram: req.body.instagram,
                        twitter: req.body.twitter,
                        web: req.body.web,
                        image: req.file !== null ? "/uploads/speakers/" + fileName : "",
                        timestamp: new Date().toISOString()
                    }
                }
            },
            { new: true},
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }

}

module.exports.editSpeakerSession = async (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown', req.params.id);
        
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

        fileName = req.body.speakerId + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/speakers/${fileName}`
            )
        );
    }

    try {
        SessionModel.findById(
            req.params.id,
            (err, docs) => {
                const theSpeaker = docs.speakers.find((session) => 
                    session._id.equals(req.body.speakerId)
                );

                if (!theSpeaker) {
                    return res.status(404).send("speaker not found");
                }
                theSpeaker.firstname = req.body.firstname,
                theSpeaker.lastname = req.body.lastname,
                theSpeaker.email = req.body.email,
                theSpeaker.fonction = req.body.fonction,
                theSpeaker.linkedIn = req.body.linkedIn,
                theSpeaker.instagram = req.body.instagram,
                theSpeaker.twitter = req.body.twitter,
                theSpeaker.image = req.file !== null ? "/uploads/speakers/" + fileName : "",
                theSpeaker.web = req.body.web

                return docs.save((err) => {
                    if (!err) {
                        return res.status(200).send(docs);
                    } else {
                        return res.status(500).send(err);
                    }
                })
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
}

module.exports.deleteSpeakerSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown', req.params.id);

    try {
        return SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    speakers: {
                        _id: req.body.speakerId,
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
}

module.exports.addFileSession = async (req, res) => {

    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    let fileName;

    if (req.file !== null) {
        try {
            //console.log("request", req);
            if (
                req.file.detectedMimeType !== "application/pdf"
            )
                throw Error("invalid file");

            if (req.file.size > 2000000)
                throw Error("max size");

        } catch (err) {
            const errors = uploadErrors(err)
            return res.status(400).json({ errors });
        }

        fileName = req.file.originalName;

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/sessions/docs/${fileName}`
            )
        );
    }

    try {
        SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    files: {
                        fileName: fileName,
                        fileLink: req.file !== null ? "/uploads/sessions/docs/" + fileName : "",
                        timestamp: new Date().toISOString()
                    }
                }
            },
            { new: true},
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }

}

module.exports.deleteFileSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown', req.params.id);

    try {
        return SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    files: {
                        _id: req.body.fileId,
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
}

module.exports.addImageSession = async (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown' + req.params.id);

    let fileName;

    if (req.file !== null) {
        try {
            if (
                req.file.detectedMimeType !== "image/jpg" &&
                req.file.detectedMimeType !== "image/png" &&
                req.file.detectedMimeType !== "image/jpeg"
            )
                throw Error("invalid file");

            if (req.file.size > 1000000)
                throw Error("max size");

        } catch (err) {
            const errors = uploadErrors(err)
            return res.status(400).json({ errors });
        }

        fileName = req.body.imageName + Date.now() + '.jpg';

        await pipeline(
            req.file.stream,
            fs.createWriteStream(
                `${__dirname}/../client/public/uploads/sessions/galerie/${fileName}`
            )
        );
    }

    try {
        SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: {
                    galerie: {
                        imageName: req.body.imageName,
                        imageLink: req.file !== null ? "/uploads/sessions/galerie/" + fileName : "",
                        timestamp: new Date().toISOString()
                    }
                }
            },
            { new: true},
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }

}

module.exports.deleteImageSession = (req, res) => {
    if (!ObjectId.isValid(req.params.id))
        return res.status(400).send('ID unknown', req.params.id);

    try {
        return SessionModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    galerie: {
                        _id: req.body.imageId,
                    },
                },
            },
            { new: true },
            (err, docs) => {
                if (!err) return res.send(docs);
                else return res.status(400).send(err);
            }
        );
    } catch (err) {
        return res.status(400).send(err);
    }
}