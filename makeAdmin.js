const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const makeAdmin = async () => {
  try {
    const email = 'admin@skybound.com';
    const password = 'admin';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin exists
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (res.rows.length > 0) {
      await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [email]);
      console.log('Existing admin account updated!');
    } else {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'admin')",
        ['Admin', email, hashedPassword]
      );
      console.log('New admin account created!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error making admin:', err);
    process.exit(1);
  }
};

makeAdmin();
