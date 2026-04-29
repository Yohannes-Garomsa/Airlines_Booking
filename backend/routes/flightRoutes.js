const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);

// Protected routes (Admin only in future, but protected for now)
router.post('/', protect, flightController.createFlight);

module.exports = router;
