const db = require('../config/db');

const Flight = {
  create: async (flightData) => {
    const { 
      airline, 
      flight_number,
      departure_airport_id, 
      arrival_airport_id, 
      departure_time, 
      arrival_time, 
      economy_price, 
      total_seats 
    } = flightData;

    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);
    
    const result = await db.query(
      `INSERT INTO flights 
       (airline, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, total_seats, available_seats) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [airline, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, total_seats, total_seats]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query(`
      SELECT f.*, 
             da.name as departure_airport_name, da.city as departure_city, da.iata_code as departure_iata,
             aa.name as arrival_airport_name, aa.city as arrival_city, aa.iata_code as arrival_iata
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
      ORDER BY f.departure_time ASC
    `);
    return result.rows;
  },

  search: async (filters) => {
    const { departure_city, arrival_city, departure_date, max_price, max_duration, sort_by, limit = 10, page = 1 } = filters;
    
    // Calculate duration in hours in the SELECT statement
    let query = `
      SELECT f.*, 
             da.name as departure_airport_name, da.city as departure_city, da.iata_code as departure_iata,
             aa.name as arrival_airport_name, aa.city as arrival_city, aa.iata_code as arrival_iata,
             EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 as duration 
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (departure_city) {
      query += ` AND (da.city ILIKE $${paramIndex} OR da.name ILIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${departure_city}%`);
    }
    if (arrival_city) {
      query += ` AND (aa.city ILIKE $${paramIndex} OR aa.name ILIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${arrival_city}%`);
    }
    if (departure_date) {
      query += ` AND DATE(f.departure_time) = $${paramIndex++}`;
      params.push(departure_date);
    }
    if (max_price) {
      query += ` AND f.economy_price <= $${paramIndex++}`;
      params.push(max_price);
    }
    if (max_duration) {
      query += ` AND EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 <= $${paramIndex++}`;
      params.push(max_duration);
    }

    // Sorting logic
    let orderBy = 'f.departure_time ASC';
    if (sort_by === 'price_low') orderBy = 'f.economy_price ASC';
    else if (sort_by === 'price_high') orderBy = 'f.economy_price DESC';
    else if (sort_by === 'duration_short') orderBy = 'duration ASC';
    else if (sort_by === 'time_late') orderBy = 'f.departure_time DESC';

    query += ` ORDER BY ${orderBy}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
    return result.rows[0];
  },

  update: async (id, flightData) => {
    const { 
      airline, 
      flight_number,
      departure_airport_id, 
      arrival_airport_id, 
      departure_time, 
      arrival_time, 
      economy_price, 
      total_seats 
    } = flightData;

    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);

    const result = await db.query(
      `UPDATE flights SET 
       airline = $1, flight_number = $2, departure_airport_id = $3, arrival_airport_id = $4, 
       departure_time = $5, arrival_time = $6, economy_price = $7, business_price = $8, 
       total_seats = $9, available_seats = $9
       WHERE id = $10 RETURNING *`,
      [airline, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, total_seats, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM flights WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  getCities: async () => {
    const result = await db.query(`
      SELECT DISTINCT city FROM (
        SELECT departure_city as city FROM flights
        UNION
        SELECT arrival_city as city FROM flights
      ) AS unique_cities 
      ORDER BY city ASC
    `);
    return result.rows.map(r => r.city);
  },

  getOrigins: async () => {
    const result = await db.query('SELECT DISTINCT departure_city as city FROM flights ORDER BY city ASC');
    return result.rows.map(r => r.city);
  },

  getDestinations: async (origin) => {
    let query = 'SELECT DISTINCT arrival_city as city FROM flights';
    const params = [];
    if (origin) {
      query += ' WHERE departure_city = $1';
      params.push(origin);
    }
    query += ' ORDER BY city ASC';
    const result = await db.query(query, params);
    return result.rows.map(r => r.city);
  }
};

module.exports = Flight;
