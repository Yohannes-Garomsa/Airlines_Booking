const express = require('express');
const router = express.Router();
const { downloadTicket, emailTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:bookingId/download', protect, downloadTicket);
router.post('/:bookingId/send', protect, emailTicket);

module.exports = router;
