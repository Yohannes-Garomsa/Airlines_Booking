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
  
  // If no tickets or the first ticket's booking is not confirmed, return error
  if (tickets.length === 0) {
    return res.status(404).json({ message: 'No tickets found for this booking' });
  }

  if (tickets[0].booking_status !== 'confirmed') {
    return res.status(403).json({ message: 'Tickets are not available for this booking status' });
  }

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