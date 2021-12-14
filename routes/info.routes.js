const router = require('express').Router();
const infoController = require('../controllers/info.controller')

router.get('/', infoController.allInfos);
router.post('/', infoController.createInfo);
router.get('/:id', infoController.infoDetails);
router.put('/:id', infoController.updateInfo);
router.delete('/:id', infoController.deleteInfo);

module.exports = router;