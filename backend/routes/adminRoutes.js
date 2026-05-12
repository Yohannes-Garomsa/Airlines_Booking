const express = require('express');
const router = express.Router();
const { 
  getDashboardStats,
  getAllBookings, 
  getBookingDetails, 
  getAllUsers, 
  toggleUserStatus, 
  changeUserRole,
  createAdmin,
  deleteUser,
  createPassenger,
  getAllAirports,
  createAirport,
  deleteAirport,
  getFleet,
  toggleAircraftStatus,
  getSeatMatrix,
  getAnalytics,
  getPayments,
  getNotifications
} = require('../controllers/adminController');
const { 
  createFlight, 
  updateFlight, 
  deleteFlight 
} = require('../controllers/flightController');
const { protectRoute, adminOnly, superAdminOnly } = require('../middleware/authMiddleware');
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
router.post('/create', superAdminOnly, createAdmin);
router.post('/users', createPassenger);
router.patch('/users/:id/role', superAdminOnly, changeUserRole);
router.delete('/users/:id', superAdminOnly, deleteUser);

// Airport management
router.get('/airports', getAllAirports);
router.post('/airports', createAirport);
router.delete('/airports/:id', deleteAirport);

// Fleet
router.get('/fleet', getFleet);
router.patch('/fleet/:id/maintenance', toggleAircraftStatus);

router.get('/seats/:flightId', getSeatMatrix);
router.get('/analytics', getAnalytics);
router.get('/payments', getPayments);
router.get('/notifications', getNotifications);

module.exports = router;
