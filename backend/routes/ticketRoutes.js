const express = require('express');
const router = express.Router();
const { 
  generateTickets, 
  getTicket, 
  downloadTicketPDF 
} = require('../controllers/ticketController');
const { protectRoute } = require('../middleware/authMiddleware');

router.use(protectRoute);

router.post('/generate', generateTickets);
router.get('/:id', getTicket);
router.get('/:id/pdf', downloadTicketPDF);
router.post('/:id/email', emailTicket);

module.exports = router;
