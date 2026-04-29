const db = require('../config/db');

const Flight = {
  getAll: async () => {
    const result = await db.query('SELECT * FROM flights ORDER BY departure_time ASC');
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.query('SELECT * FROM flights WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = Flight;
