const db = require('../config/db');

const Booking = {
  create: async (userId, flightId, totalPrice, cabinClass, passengers) => {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Security: Recalculate price from DB to prevent tampering
      const flightRes = await client.query('SELECT economy_price, business_price FROM flights WHERE id = $1', [flightId]);
      if (flightRes.rows.length === 0) throw new Error('Flight not found');
      
      const flight = flightRes.rows[0];
      const verifiedPrice = cabinClass === 'Business' ? flight.business_price : flight.economy_price;
      const finalPrice = parseFloat(verifiedPrice) * passengers.length;

      // 1. Create Booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, flight_id, total_price, cabin_class) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, flightId, finalPrice, cabinClass || 'Economy']
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
      `SELECT b.*, f.airline, f.departure_time, s.seat_number,
              da.city as departure_city, da.iata_code as departure_iata,
              aa.city as arrival_city, aa.iata_code as arrival_iata
       FROM bookings b 
       JOIN flights f ON b.flight_id = f.id 
       JOIN airports da ON f.departure_airport_id = da.id
       JOIN airports aa ON f.arrival_airport_id = aa.id
       LEFT JOIN seats s ON s.booking_id = b.id
       WHERE b.user_id = $1 
       ORDER BY b.booking_date DESC`,
      [userId]
    );
    return result.rows;
  },

  getAll: async () => {
    const result = await db.query(
      `SELECT b.*, f.airline, f.departure_city, f.arrival_city, f.departure_time, u.name as user_name 
       FROM bookings b 
       JOIN flights f ON b.flight_id = f.id 
       JOIN users u ON b.user_id = u.id 
       ORDER BY b.booking_date DESC`
    );
    return result.rows;
  },

  getFullBookingDetails: async (bookingId) => {
    const bookingResult = await db.query(
      `SELECT b.*, f.airline, f.departure_time, f.arrival_time, 
              da.city as departure_city, da.iata_code as departure_iata,
              aa.city as arrival_city, aa.iata_code as arrival_iata,
              s.seat_number 
       FROM bookings b 
       JOIN flights f ON b.flight_id = f.id 
       JOIN airports da ON f.departure_airport_id = da.id
       JOIN airports aa ON f.arrival_airport_id = aa.id
       LEFT JOIN seats s ON s.booking_id = b.id
       WHERE b.id = $1`,
      [bookingId]
    );
    
    if (bookingResult.rows.length === 0) return null;
    const booking = bookingResult.rows[0];

    const passengerResult = await db.query(
      'SELECT name, email FROM passengers WHERE booking_id = $1',
      [bookingId]
    );
    booking.passengers = passengerResult.rows;

    return booking;
  },

  cancel: async (bookingId, userId) => {
    const result = await db.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      ['cancelled', bookingId, userId]
    );
    return result.rows[0];
  }
};

module.exports = Booking;
