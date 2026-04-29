const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, admin, getAllBookings);
router.get('/user', protect, getUserBookings);
router.patch('/:bookingId/cancel', protect, cancelBooking);

module.exports = router;
