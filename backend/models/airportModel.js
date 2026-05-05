const db = require('../config/db');

const Airport = {
  search: async (keyword) => {
    const query = `
      SELECT * FROM airports 
      WHERE name ILIKE $1 
      OR city ILIKE $1 
      OR iata_code ILIKE $1 
      ORDER BY name ASC 
      LIMIT 10
    `;
    const result = await db.query(query, [`%${keyword}%`]);
    return result.rows;
  },

  getAll: async () => {
    const result = await db.query('SELECT * FROM airports ORDER BY city ASC');
    return result.rows;
  },

  getById: async (id) => {
    const result = await db.query('SELECT * FROM airports WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = Airport;
