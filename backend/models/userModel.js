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

  getById: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query('SELECT id, name, email, role, is_blocked, created_at FROM users ORDER BY created_at DESC');
    return result.rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = $${i++}`);
      values.push(value);
    }

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, role, is_blocked`;
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

module.exports = User;
