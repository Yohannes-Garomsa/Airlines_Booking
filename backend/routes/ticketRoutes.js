const express = require('express');
const router = express.Router();
const { downloadTicket, emailTicket } = require('../controllers/ticketController');
const { protectRoute } = require('../middleware/authMiddleware');

router.get('/:bookingId/download', protectRoute, downloadTicket);
router.post('/:bookingId/send', protectRoute, emailTicket);

module.exports = router;
