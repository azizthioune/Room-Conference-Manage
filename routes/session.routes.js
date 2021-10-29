const router = require('express').Router();
const sessionController = require('../controllers/session.controller');
const multer = require('multer');
const upload = multer()

router.get('/', sessionController.readSession);
router.post('/', upload.single('file'), sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);
router.patch('/like-session/:id', sessionController.likeSession);
router.patch('/unlike-session/:id', sessionController.unlikeSession);

// speakers
router.patch('/add-speaker-session/:id', sessionController.addSpeakerSession);
router.patch('/edit-speaker-session/:id', sessionController.editSpeakerSession);
router.patch('/delete-speaker-session/:id', sessionController.deleteSpeakerSession);


module.exports = router;