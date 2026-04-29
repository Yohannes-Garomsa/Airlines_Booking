const nodemailer = require('nodemailer');

const sendTicketEmail = async (userEmail, booking, pdfBuffer) => {
  // Use a mock transporter or real one if credentials provided
  // For development, we can use Ethereal or just log it
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || 'mock_user',
      pass: process.env.EMAIL_PASS || 'mock_pass',
    },
  });

  const mailOptions = {
    from: '"SkyBound Airlines" <no-reply@skybound.com>',
    to: userEmail,
    subject: `Your E-Ticket for ${booking.departure_city} to ${booking.arrival_city}`,
    text: `Hello, thank you for booking with SkyBound. Please find your ticket attached for booking #SB-${booking.id}.`,
    html: `<h1>SkyBound Airlines</h1><p>Your journey from <b>${booking.departure_city}</b> to <b>${booking.arrival_city}</b> is confirmed.</p><p>Booking ID: #SB-${booking.id}</p>`,
    attachments: [
      {
        filename: `Ticket_SB_${booking.id}.pdf`,
        content: pdfBuffer,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendTicketEmail };
