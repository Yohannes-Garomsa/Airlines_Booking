const Ticket = require('../models/ticketModel');
const Booking = require('../models/bookingModel');
const { generateTicketPDF } = require('../utils/pdfGenerator');
const { sendTicketEmail } = require('../utils/emailService');
const asyncHandler = require('../utils/asyncHandler');
const QRCode = require('qrcode');
const db = require('../config/db');

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

    // Use origin from request or fallback to default Vite port
    const origin = req.headers.origin || 'http://localhost:5173';
    
    // Comprehensive text summary + URL for the "Real Ticket" experience
    const qrData = `SKYBOUND AIRLINES BOARDING PASS
-------------------------------
PASSENGER: ${passenger.name.toUpperCase()}
FLIGHT: ${booking.flight_number || 'SB101'}
ROUTE: ${booking.departure_iata || 'TBA'} -> ${booking.arrival_iata || 'TBA'}
SEAT: ${booking.seat_number || 'TBA'}
PNR: ${booking.pnr}
DATE: ${new Date(booking.departure_time).toLocaleDateString()}
-------------------------------
VIEW DIGITAL TICKET:
${origin}/ticket/public/${bookingId}`;

    const qr_code_data = await QRCode.toDataURL(qrData);

    await Ticket.create({
      ticket_number,
      booking_id: bookingId,
      passenger_name: passenger.name,
      passenger_email: passenger.email,
      seat_number: booking.seat_number,
      gate: booking.gate || 'B24',
      terminal: booking.terminal || 'T2',
      boarding_time: boardingTime,
      qr_code_data
    });
  }

  // Fetch full details for all generated tickets to return to frontend
  const fullTickets = await Ticket.getByBookingId(bookingId);
  res.status(201).json(fullTickets);
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

  // Restrict access for cancelled or pending bookings
  if (ticket.booking_status === 'cancelled') {
    res.status(403);
    throw new Error('Ticket is no longer available for this cancelled booking');
  }
  
  if (ticket.booking_status === 'pending') {
    res.status(403);
    throw new Error('Payment required to view ticket');
  }

  res.status(200).json(ticket);
});

const getAllTickets = asyncHandler(async (req, res) => {
  const query = `
    SELECT t.*, b.pnr, b.status as booking_status, f.flight_number, f.airline, f.departure_city, f.arrival_city,
           da.iata_code as departure_iata, aa.iata_code as arrival_iata
    FROM tickets t
    JOIN bookings b ON t.booking_id = b.id
    JOIN flights f ON b.flight_id = f.id
    JOIN airports da ON f.departure_airport_id = da.id
    JOIN airports aa ON f.arrival_airport_id = aa.id
    WHERE b.status != 'cancelled'
    ORDER BY t.created_at DESC
  `;
  const result = await db.query(query);
  res.status(200).json(result.rows);
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

  if (ticket.booking_status === 'cancelled') {
    res.status(403);
    throw new Error('Ticket download not available for cancelled bookings');
  }

  if (ticket.booking_status === 'pending') {
    res.status(403);
    throw new Error('Payment required to download ticket');
  }

  // Set headers before starting the pipe
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Ticket_${ticket.ticket_number}.pdf"`);

  try {
    // Generate and pipe directly to response
    generateTicketPDF(ticket, res);
    
    // We don't need to explicitly await res 'finish' if we're piping synchronously
    // but we should ensure we don't send any more data.
  } catch (err) {
    console.error('PDF Generation Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error generating PDF' });
    }
  }
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

  if (ticket.booking_status === 'cancelled') {
    res.status(403);
    throw new Error('Ticket emailing not available for cancelled bookings');
  }

  // Buffer PDF to attach it
  const chunks = [];
  const stream = new PassThrough();
  stream.on('data', chunk => chunks.push(chunk));
  
  generateTicketPDF(ticket, stream);

  stream.on('end', async () => {
    try {
      const pdfBuffer = Buffer.concat(chunks);
      const targetEmail = ticket.passenger_email || req.user.email;
      
      await sendTicketEmail(targetEmail, ticket, pdfBuffer);
      res.status(200).json({ message: 'Ticket emailed successfully' });
    } catch (error) {
      console.error('Failed to email ticket:', error);
      res.status(500).json({ message: 'Failed to send email. Ensure SMTP credentials are correct.' });
    }
  });
});

const verifyTicket = asyncHandler(async (req, res) => {
  const { identifier } = req.params; // Can be ID or PNR
  
  let query = 'SELECT t.*, b.status as booking_status, f.flight_number, f.departure_city, f.arrival_city, f.departure_time FROM tickets t JOIN bookings b ON t.booking_id = b.id JOIN flights f ON b.flight_id = f.id WHERE t.id::text = $1 OR b.pnr = $1';
  const result = await db.query(query, [identifier]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ valid: false, message: 'Ticket not found or invalid' });
  }

  const ticket = result.rows[0];
  const isExpired = new Date(ticket.departure_time) < new Date();
  const isValid = ticket.booking_status === 'confirmed' && !isExpired;

  res.status(200).json({
    valid: isValid,
    status: isValid ? 'VALID' : (isExpired ? 'EXPIRED' : 'CANCELLED/INVALID'),
    ticket
  });
});

module.exports = {
  generateTickets,
  getTicket,
  downloadTicketPDF,
  emailTicket,
  verifyTicket,
  getAllTickets
};
