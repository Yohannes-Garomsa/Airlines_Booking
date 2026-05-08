const db = require('../config/db');

const Payment = {
  process: async (bookingId, amount, paymentMethod) => {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const bookingRes = await client.query(
        'SELECT status, booking_date FROM bookings WHERE id = $1 FOR UPDATE',
        [bookingId]
      );
      if (bookingRes.rows.length === 0) {
        throw new Error('Booking not found');
      }

      const booking = bookingRes.rows[0];
      const expired = booking.status === 'pending' && new Date(booking.booking_date) < new Date(Date.now() - 3 * 60 * 60 * 1000);

      if (expired) {
        await client.query(
          'UPDATE bookings SET status = $1 WHERE id = $2',
          ['cancelled', bookingId]
        );
        throw new Error('Booking payment window has expired');
      }

      if (booking.status !== 'pending') {
        throw new Error('Booking is not pending payment');
      }

      // 1. Create Payment record
      const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;
      const paymentResult = await client.query(
        'INSERT INTO payments (booking_id, amount, payment_method, transaction_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [bookingId, amount, paymentMethod, transactionId]
      );
      const payment = paymentResult.rows[0];

      // 2. Update Booking status
      await client.query(
        'UPDATE bookings SET status = $1 WHERE id = $2',
        ['confirmed', bookingId]
      );

      await client.query('COMMIT');
      return payment;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = Payment;
