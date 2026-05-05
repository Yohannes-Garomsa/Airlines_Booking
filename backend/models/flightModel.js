const db = require('../config/db');

const Flight = {
  create: async (flightData) => {
    const { airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, economy_seats, business_seats } = flightData;
    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);
    
    const result = await db.query(
      'INSERT INTO flights (airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query('SELECT * FROM flights ORDER BY departure_time ASC');
    return result.rows;
  },

  search: async (filters) => {
    const { departure_city, arrival_city, departure_date, max_price, limit = 10, page = 1 } = filters;
    let query = 'SELECT * FROM flights WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (departure_city) {
      query += ` AND departure_city ILIKE $${paramIndex++}`;
      params.push(`%${departure_city}%`);
    }
    if (arrival_city) {
      query += ` AND arrival_city ILIKE $${paramIndex++}`;
      params.push(`%${arrival_city}%`);
    }
    if (departure_date) {
      query += ` AND DATE(departure_time) = $${paramIndex++}`;
      params.push(departure_date);
    }
    if (max_price) {
      query += ` AND economy_price <= $${paramIndex++}`;
      params.push(max_price);
    }

    const offset = (page - 1) * limit;
    query += ` ORDER BY departure_time ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
    return result.rows[0];
  },

  update: async (id, flightData) => {
    const { airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, economy_seats, business_seats } = flightData;
    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);

    const result = await db.query(
      `UPDATE flights SET 
       airline = $1, departure_city = $2, arrival_city = $3, 
       departure_time = $4, arrival_time = $5, economy_price = $6, business_price = $7, 
       economy_seats = $8, business_seats = $9 
       WHERE id = $10 RETURNING *`,
      [airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats, id]
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

  getDestinations: async () => {
    const result = await db.query('SELECT DISTINCT arrival_city as city FROM flights ORDER BY city ASC');
    return result.rows.map(r => r.city);
  }
};

module.exports = Flight;
