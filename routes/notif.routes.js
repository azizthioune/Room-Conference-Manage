const router = require('express').Router();
const notifController = require('../controllers/notif.controller');

router.get('/', notifController.allNotif);

module.exports = router;