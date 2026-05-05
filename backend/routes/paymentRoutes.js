const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/paymentController');
const { protectRoute } = require('../middleware/authMiddleware');

router.post('/', protectRoute, processPayment);

module.exports = router;
