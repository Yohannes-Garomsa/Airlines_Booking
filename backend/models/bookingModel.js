const db = require('../config/db');

const Booking = {
  create: async (userId, flightId, totalPrice, passengers) => {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // 1. Create Booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, flight_id, total_price) VALUES ($1, $2, $3) RETURNING *',
        [userId, flightId, totalPrice]
      );
      const booking = bookingResult.rows[0];

      // 2. Create Passengers
      for (const p of passengers) {
        await client.query(
          'INSERT INTO passengers (booking_id, name, email) VALUES ($1, $2, $3)',
          [booking.id, p.name, p.email]
        );
      }

      await client.query('COMMIT');
      return { ...booking, passengers };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  getByUserId: async (userId) => {
    const result = await db.query(
      `SELECT b.*, f.airline, f.departure_city, f.arrival_city, f.departure_time 
       FROM bookings b 
       JOIN flights f ON b.flight_id = f.id 
       WHERE b.user_id = $1 
       ORDER BY b.booking_date DESC`,
      [userId]
    );
    return result.rows;
  }
};

module.exports = Booking;
