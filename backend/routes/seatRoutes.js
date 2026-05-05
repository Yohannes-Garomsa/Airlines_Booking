const express = require('express');
const router = express.Router();
const { getFlightSeats, reserveSeat } = require('../controllers/seatController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/flight/:flightId', getFlightSeats);
router.patch('/reserve', protectRoute, reserveSeat);

module.exports = router;
