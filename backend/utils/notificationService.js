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

const sendBookingConfirmation = async (user, booking, flight) => {
  const emailSubject = `SkyBound Booking Confirmation: #${booking.id}`;
  const emailText = `Hello ${user.name}, your flight ${flight.airline} from ${flight.departure_city} to ${flight.arrival_city} is confirmed!`;
  
  await sendEmail(user.email, emailSubject, emailText);
  
  // If user has phone, send SMS
  if (user.phone) {
    await sendSMS(user.phone, `SkyBound: Flight confirmed! Ref: #${booking.id}`);
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendBookingConfirmation
};
