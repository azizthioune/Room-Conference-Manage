const router = require('express').Router();
const actuController = require('../controllers/actu.controller')
const multer = require('multer');
const upload = multer()

router.get('/', actuController.allActu);
router.post('/', upload.single('file'), actuController.createActu);
router.get('/:id', actuController.actuInfo);
router.put('/:id', actuController.updateActu);
router.delete('/:id', actuController.deleteActu);

module.exports = router;