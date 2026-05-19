const db = require('../config/db');

// Shared SELECT fragment for ticket queries — joins normalized airline name
// and airport city names from their respective tables.
const TICKET_SELECT = `
  SELECT
    t.*,
    b.pnr, b.cabin_class, b.status AS booking_status,
    al.name          AS airline,
    f.flight_number,
    f.departure_time, f.arrival_time,
    da.city          AS departure_city,
    da.iata_code     AS departure_iata,
    aa.city          AS arrival_city,
    aa.iata_code     AS arrival_iata
  FROM tickets t
  JOIN bookings b   ON t.booking_id            = b.id
  JOIN flights  f   ON b.flight_id             = f.id
  JOIN airlines al  ON f.airline_id            = al.id
  JOIN airports da  ON f.departure_airport_id  = da.id
  JOIN airports aa  ON f.arrival_airport_id    = aa.id
`;

const Ticket = {
  /**
   * Create a ticket. passenger_id links the ticket to the normalized
   * passengers table for full referential integrity.
   */
  create: async (ticketData) => {
    const {
      ticket_number,
      booking_id,
      passenger_id,       // [FIX-5] normalized FK
      passenger_name,     // immutable boarding-pass snapshot
      passenger_email,
      seat_number,
      gate,
      terminal,
      boarding_time,
      qr_code_data,
    } = ticketData;

    const result = await db.query(
      `INSERT INTO tickets
         (ticket_number, booking_id, passenger_id,
          passenger_name, passenger_email,
          seat_number, gate, terminal, boarding_time, qr_code_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        ticket_number, booking_id, passenger_id || null,
        passenger_name, passenger_email || null,
        seat_number || null, gate || null, terminal || null,
        boarding_time || null, qr_code_data || null,
      ]
    );
    return result.rows[0];
  },

  /** Return all tickets for a booking. */
  getByBookingId: async (bookingId) => {
    const result = await db.query(
      `${TICKET_SELECT} WHERE t.booking_id = $1`,
      [bookingId]
    );
    return result.rows;
  },

  /** Return a single ticket by its primary key. */
  getById: async (id) => {
    const result = await db.query(
      `${TICKET_SELECT} WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = Ticket;
