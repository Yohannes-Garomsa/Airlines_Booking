const Booking = require('../models/bookingModel');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/emailService');
const asyncHandler = require('../utils/asyncHandler');
const { PassThrough } = require('stream');

const downloadTicket = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.getFullBookingDetails(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Security check: ensure user owns the booking (unless admin)
  if (booking.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this ticket');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Ticket_SB_${bookingId}.pdf`);

  generateTicketPDF(booking, res);
});

const emailTicket = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.getFullBookingDetails(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Buffer PDF to attach it
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', chunk => chunks.push(chunk));
  
  generateTicketPDF(booking, stream);

  stream.on('end', async () => {
    const pdfBuffer = Buffer.concat(chunks);
    // In a real app, you'd get the user's email from the DB
    // For this demo, we'll use the email from the first passenger or a fixed one
    const targetEmail = booking.passengers[0]?.email || 'user@example.com';
    
    await sendTicketEmail(targetEmail, booking, pdfBuffer);
    res.status(200).json({ message: 'Ticket emailed successfully' });
  });
});

module.exports = { downloadTicket, emailTicket };
