const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/check-availability', bookingController.checkAvailability);
router.get('/', bookingController.listBookings);
router.get('/:id', bookingController.getBooking);
router.post('/', bookingController.createBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;
