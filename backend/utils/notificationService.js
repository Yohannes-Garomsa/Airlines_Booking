/**
 * Notification Service (Mock)
 * In a real production environment, this would use:
 * - Email: SendGrid, Mailgun, or AWS SES
 * - SMS: Twilio, Vonage, or AWS SNS
 */

const sendEmail = async (to, subject, text, html) => {
  console.log('--- EMAIL NOTIFICATION SENT ---');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text}`);
  console.log('-------------------------------');
  return { success: true, messageId: `mock-email-${Date.now()}` };
};

const sendSMS = async (to, message) => {
  console.log('--- SMS NOTIFICATION SENT ---');
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log('-----------------------------');
  return { success: true, messageId: `mock-sms-${Date.now()}` };
};

const { sendTicketEmail } = require('./emailService');
const Ticket = require('../models/ticketModel');
const { generateTicketPDF } = require('./pdfGenerator');
const { PassThrough } = require('stream');
const QRCode = require('qrcode');

const sendBookingConfirmation = async (user, booking, flight) => {
  // 1. Generate Tickets automatically for the booking
  const tickets = [];
  for (const passenger of booking.passengers) {
    const ticket_number = '220' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    const departureTime = new Date(flight.departure_time);
    const boardingTime = new Date(departureTime.getTime() - 45 * 60000);

    const qrData = `SKYBOUND AIRLINES BOARDING PASS
-------------------------------
PASSENGER: ${passenger.name.toUpperCase()}
FLIGHT: ${flight.flight_number}
PNR: ${booking.pnr}
DATE: ${new Date(flight.departure_time).toLocaleDateString()}
-------------------------------
VIEW DIGITAL TICKET:
http://localhost:5173/ticket/public/${booking.id}`;

    const qr_code_data = await QRCode.toDataURL(qrData);

    const ticket = await Ticket.create({
      ticket_number,
      booking_id: booking.id,
      passenger_name: passenger.name,
      passenger_email: passenger.email || user.email,
      seat_number: 'TBA',
      gate: flight.gate || 'B24',
      terminal: flight.terminal || 'T2',
      boarding_time: boardingTime,
      qr_code_data
    });
    tickets.push(ticket);
  }

  // 2. For the first ticket, generate PDF and email it
  if (tickets.length > 0) {
    const fullTicket = await Ticket.getById(tickets[0].id);
    
    // Buffer PDF
    const chunks = [];
    const stream = new PassThrough();
    stream.on('data', chunk => chunks.push(chunk));
    
    generateTicketPDF(fullTicket, stream);

    await new Promise((resolve) => {
      stream.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        try {
          await sendTicketEmail(user.email, fullTicket, pdfBuffer);
        } catch (emailErr) {
          console.error('Email delivery failed, but booking was successful:', emailErr.message);
        }
        resolve();
      });
    });
  }

  console.log(`--- CONFIRMATION FLOW COMPLETED FOR BOOKING #${booking.id} ---`);
};

module.exports = {
  sendEmail,
  sendSMS,
  sendBookingConfirmation
};
