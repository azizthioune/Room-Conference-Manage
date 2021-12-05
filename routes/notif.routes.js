const router = require('express').Router();
const notifController = require('../controllers/notif.controller');

router.get('/', notifController.allNotif);
router.put('/:id', notifController.updateNotif);

module.exports = router;