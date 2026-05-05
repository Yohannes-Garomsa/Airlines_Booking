const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', flightController.getAllFlights);
router.get('/cities', flightController.getCities);
router.get('/origins', flightController.getOrigins);
router.get('/destinations', flightController.getDestinations);
router.get('/:id', flightController.getFlightById);

module.exports = router;
