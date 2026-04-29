const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public routes
router.get('/', flightController.getAllFlights);
router.get('/:id', flightController.getFlightById);

// Admin routes
router.post('/', protect, admin, flightController.createFlight);
router.put('/:id', protect, admin, flightController.updateFlight);
router.delete('/:id', protect, admin, flightController.deleteFlight);

module.exports = router;
