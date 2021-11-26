const router = require('express').Router();
const hotelController = require('../controllers/hotel.controller')
const multer = require('multer');
const upload = multer()

router.get('/', hotelController.allHotels);
router.post('/', upload.single('file'), hotelController.createHotel);
router.get('/:id', hotelController.hotelInfo);
router.put('/:id', hotelController.updateHotel);
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;