const express = require('express');
const router = express.Router();
const {
  getAllPassengers,
  getPassengerById,
  createPassenger,
  updatePassenger,
  deletePassenger,
  verifyPassenger
} = require('../controllers/passengerController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

// All routes are protected and require admin access
router.use(protectRoute);
router.use(adminOnly);

router.route('/')
  .get(getAllPassengers)
  .post(createPassenger);

router.route('/:id')
  .get(getPassengerById)
  .put(updatePassenger)
  .delete(deletePassenger);

router.route('/:id/verify')
  .patch(verifyPassenger);

module.exports = router;
