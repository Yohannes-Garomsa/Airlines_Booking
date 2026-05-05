const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllBookings, 
  getBookingDetails, 
  getAllUsers, 
  toggleUserStatus, 
  changeUserRole 
} = require('../controllers/adminController');
const { 
  createFlight, 
  updateFlight, 
  deleteFlight 
} = require('../controllers/flightController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');
const { validateFlight } = require('../middleware/validationMiddleware');

// All routes here are protected and admin-only
router.use(protectRoute);
router.use(adminOnly);

router.get('/stats', getDashboardStats);

// Flight Management
router.post('/flights', validateFlight, createFlight);
router.put('/flights/:id', validateFlight, updateFlight);
router.delete('/flights/:id', deleteFlight);

// Booking Management
router.get('/bookings', getAllBookings);
router.get('/bookings/:id', getBookingDetails);

// User Management
router.get('/users', getAllUsers);
router.patch('/users/:id/status', toggleUserStatus);
router.patch('/users/:id/role', changeUserRole);

module.exports = router;
