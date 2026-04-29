const db = require('../config/db');

const Flight = {
  create: async (flightData) => {
    const { airline, departure_city, arrival_city, departure_time, arrival_time, price, seats_available } = flightData;
    const result = await db.query(
      'INSERT INTO flights (airline, departure_city, arrival_city, departure_time, arrival_time, price, seats_available) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [airline, departure_city, arrival_city, departure_time, arrival_time, price, seats_available]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query('SELECT * FROM flights ORDER BY departure_time ASC');
    return result.rows;
  },

  search: async (filters) => {
    const { departure_city, arrival_city, departure_date } = filters;
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

    query += ' ORDER BY departure_time ASC';
    const result = await db.query(query, params);
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = Flight;
