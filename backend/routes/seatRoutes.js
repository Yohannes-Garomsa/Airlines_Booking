const express = require('express');
const router = express.Router();
const { getFlightSeats, reserveSeat } = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/flight/:flightId', getFlightSeats);
router.patch('/reserve', protect, reserveSeat);

module.exports = router;
