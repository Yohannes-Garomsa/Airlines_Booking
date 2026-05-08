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

// Admin routes
router.post('/', protectRoute, adminOnly, flightController.createFlight);
router.post('/admin/flights', protectRoute, adminOnly, flightController.createFlight);
router.put('/:id', protectRoute, adminOnly, flightController.updateFlight);
router.delete('/:id', protectRoute, adminOnly, flightController.deleteFlight);

module.exports = router;
