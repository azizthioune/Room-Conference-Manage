const router = require('express').Router();
const sessionController = require('../controllers/session.controller');
const multer = require('multer');
const upload = multer()

router.get('/', sessionController.allSessions);
router.post('/', upload.single('file'), sessionController.createSession);
router.get('/:id', sessionController.sessionInfo);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);
router.patch('/like-session/:id', sessionController.likeSession);
router.patch('/unlike-session/:id', sessionController.unlikeSession);

// speakers
router.patch('/add-speaker-session/:id', upload.single('file'), sessionController.addSpeakerSession);
router.patch('/edit-speaker-session/:id', upload.single('file'), sessionController.editSpeakerSession);
router.patch('/delete-speaker-session/:id', sessionController.deleteSpeakerSession);

//pdf docs
router.patch('/add-pdf/:id', upload.single('file'), sessionController.addFileSession);
router.patch('/delete-pdf/:id', upload.single('file'), sessionController.deleteFileSession);


module.exports = router;