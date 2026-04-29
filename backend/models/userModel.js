const db = require('../config/db');

const User = {
  create: async (name, email, password, role = 'user') => {
    const result = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password, role]
    );
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  }
};

module.exports = User;
