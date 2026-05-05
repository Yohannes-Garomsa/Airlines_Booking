const Ticket = require('../models/ticketModel');
const Booking = require('../models/bookingModel');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/emailService');
const asyncHandler = require('../utils/asyncHandler');
const QRCode = require('qrcode');

// @desc    Generate tickets for a booking
// @route   POST /api/tickets/generate
// @access  Private
const generateTickets = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.getFullBookingDetails(bookingId);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Only generate if paid (mocking payment check here)
  if (booking.status !== 'confirmed') {
    res.status(400);
    throw new Error('Payment required to generate tickets');
  }

  // Check if tickets already exist
  const existingTickets = await Ticket.getByBookingId(bookingId);
  if (existingTickets.length > 0) {
    return res.status(200).json(existingTickets);
  }

  const tickets = [];
  for (const passenger of booking.passengers) {
    // Generate 13-digit ticket number
    const ticket_number = '220' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    
    // Boarding time is usually 45-60 mins before departure
    const departureTime = new Date(booking.departure_time);
    const boardingTime = new Date(departureTime.getTime() - 45 * 60000);

    // QR Code data
    const qrData = JSON.stringify({
      t: ticket_number,
      pnr: booking.pnr,
      f: booking.flight_id,
      s: booking.seat_number
    });

    const qr_code_data = await QRCode.toDataURL(qrData);

    const ticket = await Ticket.create({
      ticket_number,
      booking_id: bookingId,
      passenger_name: passenger.name,
      passenger_email: passenger.email,
      seat_number: booking.seat_number,
      gate: 'B24',
      terminal: 'T2',
      boarding_time: boardingTime,
      qr_code_data
    });
    tickets.push(ticket);
  }

  res.status(201).json(tickets);
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.getById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }
  res.status(200).json(ticket);
});

// @desc    Download ticket PDF
// @route   GET /api/tickets/:id/pdf
// @access  Private
const downloadTicketPDF = asyncHandler(async (req, res) => {
  const ticket = await Ticket.getById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Ticket_${ticket.ticket_number}.pdf`);

  generateTicketPDF(ticket, res);
});

const { PassThrough } = require('stream');

// @desc    Email ticket to passenger
// @route   POST /api/tickets/:id/email
// @access  Private
const emailTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.getById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error('Ticket not found');
  }

  // Buffer PDF to attach it
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', chunk => chunks.push(chunk));
  
  generateTicketPDF(ticket, stream);

  stream.on('end', async () => {
    const pdfBuffer = Buffer.concat(chunks);
    const targetEmail = ticket.passenger_email || req.user.email;
    
    await sendTicketEmail(targetEmail, ticket, pdfBuffer);
    res.status(200).json({ message: 'Ticket emailed successfully' });
  });
});

module.exports = {
  generateTickets,
  getTicket,
  downloadTicketPDF,
  emailTicket
};
