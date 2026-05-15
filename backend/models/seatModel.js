const db = require('../config/db');

const Seat = {
  getByFlightId: async (flightId) => {
    const result = await db.query(
      'SELECT * FROM seats WHERE flight_id = $1 ORDER BY seat_number ASC',
      [flightId]
    );
    return result.rows;
  },

  reserve: async (flightId, seatNumber, bookingId) => {
    const result = await db.query(
      'UPDATE seats SET is_occupied = TRUE, booking_id = $1 WHERE flight_id = $2 AND seat_number = $3 AND is_occupied = FALSE RETURNING *',
      [bookingId, flightId, seatNumber]
    );
    return result.rows[0];
  },

  // Helper for admins to initialize seats for a flight
  initialize: async (flightId, rows = 10, seatsPerRow = 6) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const queries = [];
    
    for (let r = 1; r <= rows; r++) {
      const seatClass = r <= 2 ? 'Business' : 'Economy';
      for (let s = 0; s < (r <= 2 ? 4 : seatsPerRow); s++) { // Business rows often have fewer seats
        const seatNum = `${r}${letters[s]}`;
        queries.push(db.query(
          'INSERT INTO seats (flight_id, seat_number, seat_class) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [flightId, seatNum, seatClass]
        ));
      }
    }
    await Promise.all(queries);
  }
};

module.exports = Seat;
