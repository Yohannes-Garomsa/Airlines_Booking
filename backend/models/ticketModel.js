const db = require('../config/db');

const Ticket = {
  create: async (ticketData) => {
    const { 
      ticket_number, 
      booking_id, 
      passenger_name, 
      passenger_email, 
      seat_number, 
      gate, 
      terminal, 
      boarding_time, 
      qr_code_data 
    } = ticketData;

    const result = await db.query(
      `INSERT INTO tickets 
       (ticket_number, booking_id, passenger_name, passenger_email, seat_number, gate, terminal, boarding_time, qr_code_data) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [ticket_number, booking_id, passenger_name, passenger_email, seat_number, gate, terminal, boarding_time, qr_code_data]
    );
    return result.rows[0];
  },

  getByBookingId: async (bookingId) => {
    const result = await db.query(
      `SELECT t.*, b.pnr, b.cabin_class, f.airline, f.flight_number, f.departure_time, f.arrival_time,
              da.city as departure_city, da.iata_code as departure_iata,
              aa.city as arrival_city, aa.iata_code as arrival_iata
       FROM tickets t
       JOIN bookings b ON t.booking_id = b.id
       JOIN flights f ON b.flight_id = f.id
       JOIN airports da ON f.departure_airport_id = da.id
       JOIN airports aa ON f.arrival_airport_id = aa.id
       WHERE t.booking_id = $1`,
      [bookingId]
    );
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query(
      `SELECT t.*, b.pnr, b.cabin_class, f.airline, f.flight_number, f.departure_time, f.arrival_time,
              da.city as departure_city, da.iata_code as departure_iata,
              aa.city as arrival_city, aa.iata_code as arrival_iata
       FROM tickets t
       JOIN bookings b ON t.booking_id = b.id
       JOIN flights f ON b.flight_id = f.id
       JOIN airports da ON f.departure_airport_id = da.id
       JOIN airports aa ON f.arrival_airport_id = aa.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  }
};

module.exports = Ticket;
