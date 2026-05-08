const express = require('express');
const router = express.Router();

const { 
  generateTickets, 
  getTicket, 
  downloadTicketPDF,
  emailTicket,
  verifyTicket,
  getAllTickets
} = require('../controllers/ticketController');

const { protectRoute, adminOnly } = require('../middleware/authMiddleware');
const Ticket = require('../models/ticketModel');
const asyncHandler = require('../utils/asyncHandler');

// Public routes (No auth required for QR scan or browser PDF download)
router.get('/public/:id', getTicket);
router.get('/public/booking/:bookingId', asyncHandler(async (req, res) => {
  const tickets = await Ticket.getByBookingId(req.params.bookingId);
  res.status(200).json(tickets);
}));
router.get('/verify/:identifier', verifyTicket);
router.get('/:id/pdf', downloadTicketPDF); 

// Protected routes (Login required)
router.use(protectRoute);

router.get('/', adminOnly, getAllTickets);
router.post('/generate', generateTickets);
router.get('/:id', getTicket);
router.post('/:id/email', emailTicket);

module.exports = router;