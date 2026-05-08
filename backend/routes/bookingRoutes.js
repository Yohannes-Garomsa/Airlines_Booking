const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking, getAllBookings, updateBookingStatus } = require('../controllers/bookingController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.use(protectRoute);

router.post('/', createBooking);
router.get('/', adminOnly, getAllBookings);
router.get('/user', getUserBookings);
router.patch('/:id/status', adminOnly, updateBookingStatus);
router.patch('/:bookingId/cancel', cancelBooking);

module.exports = router;
