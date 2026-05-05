const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protectRoute, createBooking);
router.get('/', protectRoute, adminOnly, getAllBookings);
router.get('/user', protectRoute, getUserBookings);
router.patch('/:bookingId/cancel', protectRoute, cancelBooking);

module.exports = router;
