const db = require('../config/db');

// ---------------------------------------------------------------------------
// Shared SELECT fragment — always returns the same rich shape:
//   airline name from airlines table, city names from airports table.
//   business_price and total_seats are GENERATED columns, returned automatically.
// ---------------------------------------------------------------------------
const FLIGHT_SELECT = `
  SELECT
    f.*,
    al.name          AS airline,
    al.iata_code     AS airline_iata,
    da.name          AS departure_airport_name,
    da.city          AS departure_city,
    da.country       AS departure_country,
    da.iata_code     AS departure_iata,
    aa.name          AS arrival_airport_name,
    aa.city          AS arrival_city,
    aa.country       AS arrival_country,
    aa.iata_code     AS arrival_iata,
    air.model        AS aircraft_model,
    air.tail_number,
    EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 AS duration
  FROM flights f
  JOIN airlines al  ON f.airline_id            = al.id
  JOIN airports da  ON f.departure_airport_id  = da.id
  JOIN airports aa  ON f.arrival_airport_id    = aa.id
  LEFT JOIN aircraft air ON f.aircraft_id      = air.id
`;

// ---------------------------------------------------------------------------
// Helper: resolve airline_id from a plain airline name string.
// Used for backwards-compatibility when the admin form still sends "airline"
// as a string. Inserts the airline if it doesn't exist yet.
// ---------------------------------------------------------------------------
const resolveAirlineId = async (airline) => {
  if (!airline) throw new Error('Airline name is required');
  const existing = await db.query(
    'SELECT id FROM airlines WHERE LOWER(name) = LOWER($1)',
    [airline]
  );
  if (existing.rows.length > 0) return existing.rows[0].id;
  // Auto-create unknown airlines so the form still works
  const inserted = await db.query(
    'INSERT INTO airlines (name) VALUES ($1) RETURNING id',
    [airline]
  );
  return inserted.rows[0].id;
};

// ---------------------------------------------------------------------------
// Helper: resolve economy_seats / business_seats from aircraft or totals.
// ---------------------------------------------------------------------------
const resolveSeatCounts = async (aircraft_id, provided_total_seats) => {
  if (aircraft_id) {
    const res = await db.query(
      'SELECT economy_capacity, business_capacity FROM aircraft WHERE id = $1',
      [aircraft_id]
    );
    if (res.rows.length > 0) {
      return {
        economy_seats: res.rows[0].economy_capacity,
        business_seats: res.rows[0].business_capacity,
      };
    }
  }
  // Fallback: split provided total (85% economy, 15% business)
  const total = provided_total_seats || 180;
  const economy_seats = Math.floor(total * 0.85);
  const business_seats = total - economy_seats;
  return { economy_seats, business_seats };
};

// ---------------------------------------------------------------------------
const Flight = {

  /**
   * Create a new flight.
   * Accepts either `airline_id` (normalized) or `airline` string (legacy form).
   * business_price and total_seats are GENERATED — never inserted manually.
   */
  create: async (flightData) => {
    const {
      airline,          // legacy string from admin form
      airline_id,       // preferred normalized FK
      flight_number,
      departure_airport_id,
      arrival_airport_id,
      departure_time,
      arrival_time,
      economy_price,
      total_seats: provided_total_seats,
      aircraft_id,
      status,
      gate,
      terminal,
      booking_type,
    } = flightData;

    // Resolve airline_id — prefer explicit FK, fall back to name lookup
    const resolvedAirlineId = airline_id || (await resolveAirlineId(airline));

    // Seat counts — from aircraft table or fallback split
    const { economy_seats, business_seats } = await resolveSeatCounts(
      aircraft_id,
      provided_total_seats
    );

    const result = await db.query(
      `INSERT INTO flights
         (airline_id, flight_number,
          departure_airport_id, arrival_airport_id,
          departure_time, arrival_time,
          economy_price,
          economy_seats, business_seats, available_seats,
          aircraft_id, status, gate, terminal, booking_type)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        resolvedAirlineId, flight_number,
        departure_airport_id, arrival_airport_id,
        departure_time, arrival_time,
        economy_price,
        economy_seats, business_seats, economy_seats + business_seats,
        aircraft_id || null, status || 'Scheduled', gate || null, terminal || null,
        booking_type || 'normal',
      ]
    );
    return result.rows[0];
  },

  /**
   * Return all flights with joined airline name, airport cities, and aircraft info.
   */
  getAll: async () => {
    const result = await db.query(
      `${FLIGHT_SELECT} ORDER BY (CASE WHEN f.booking_type = 'booking' THEN 0 ELSE 1 END) ASC, f.departure_time ASC`
    );
    return result.rows;
  },

  /**
   * Search flights by city name, date, price, and duration filters.
   * Cities are matched against airports.city (authoritative source).
   */
  search: async (filters) => {
    const {
      departure_city,
      arrival_city,
      departure_date,
      max_price,
      max_duration,
      sort_by,
      limit = 10,
      page = 1,
    } = filters;

    let query = `
      ${FLIGHT_SELECT}
      WHERE f.available_seats > 0
        AND f.status NOT IN ('Cancelled','Landed')
    `;
    const params = [];
    let idx = 1;

    if (departure_city) {
      query += ` AND (da.city ILIKE $${idx} OR da.name ILIKE $${idx})`;
      params.push(`%${departure_city}%`);
      idx++;
    }
    if (arrival_city) {
      query += ` AND (aa.city ILIKE $${idx} OR aa.name ILIKE $${idx})`;
      params.push(`%${arrival_city}%`);
      idx++;
    }
    if (departure_date) {
      query += ` AND DATE(f.departure_time) = $${idx++}`;
      params.push(departure_date);
    }
    if (max_price) {
      query += ` AND f.economy_price <= $${idx++}`;
      params.push(max_price);
    }
    if (max_duration) {
      query += ` AND EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 <= $${idx++}`;
      params.push(max_duration);
    }

    const orderMap = {
      price_low:       'f.economy_price ASC',
      price_high:      'f.economy_price DESC',
      duration_short:  'EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 ASC',
      time_late:       'f.departure_time DESC',
    };
    query += ` ORDER BY ${orderMap[sort_by] || 'f.departure_time ASC'}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Get a single flight by ID with full joined data.
   */
  getById: async (id) => {
    const result = await db.query(
      `${FLIGHT_SELECT} WHERE f.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Update an existing flight.
   * business_price and total_seats are GENERATED — never updated manually.
   */
  update: async (id, flightData) => {
    const {
      airline,
      airline_id,
      flight_number,
      departure_airport_id,
      arrival_airport_id,
      departure_time,
      arrival_time,
      economy_price,
      total_seats: provided_total_seats,
      aircraft_id,
      status,
      gate,
      terminal,
      booking_type,
    } = flightData;

    const resolvedAirlineId = airline_id || (await resolveAirlineId(airline));
    const { economy_seats, business_seats } = await resolveSeatCounts(
      aircraft_id,
      provided_total_seats
    );

    const result = await db.query(
      `UPDATE flights SET
         airline_id           = $1,
         flight_number        = $2,
         departure_airport_id = $3,
         arrival_airport_id   = $4,
         departure_time       = $5,
         arrival_time         = $6,
         economy_price        = $7,
         economy_seats        = $8,
         business_seats       = $9,
         available_seats      = $10,
         aircraft_id          = $11,
         status               = $12,
         gate                 = $13,
         terminal             = $14,
         booking_type         = $15
       WHERE id = $16
       RETURNING *`,
      [
        resolvedAirlineId, flight_number,
        departure_airport_id, arrival_airport_id,
        departure_time, arrival_time,
        economy_price,
        economy_seats, business_seats, economy_seats + business_seats,
        aircraft_id || null, status || 'Scheduled',
        gate || null, terminal || null,
        booking_type || 'normal',
        id,
      ]
    );
    return result.rows[0];
  },

  /**
   * Delete a flight by ID.
   */
  delete: async (id) => {
    const result = await db.query(
      'DELETE FROM flights WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Return distinct origin cities (from airports table — normalized source).
   */
  getOrigins: async () => {
    const result = await db.query(`
      SELECT DISTINCT a.city
      FROM airports a
      JOIN flights f ON f.departure_airport_id = a.id
      WHERE f.status NOT IN ('Cancelled','Landed')
      ORDER BY a.city ASC
    `);
    return result.rows.map(r => r.city);
  },

  /**
   * Return distinct destination cities for a given origin city.
   */
  getDestinations: async (originCity) => {
    let query = `
      SELECT DISTINCT aa.city
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id   = aa.id
      WHERE f.status NOT IN ('Cancelled','Landed')
    `;
    const params = [];
    if (originCity) {
      query += ' AND da.city = $1';
      params.push(originCity);
    }
    query += ' ORDER BY aa.city ASC';
    const result = await db.query(query, params);
    return result.rows.map(r => r.city);
  },

  /**
   * Legacy alias for city list (used by some older API routes).
   */
  getCities: async () => {
    const result = await db.query(
      'SELECT DISTINCT city FROM airports ORDER BY city ASC'
    );
    return result.rows.map(r => r.city);
  },
};

module.exports = Flight;
