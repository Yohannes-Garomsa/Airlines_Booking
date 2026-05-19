const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('supabase.com') 
    ? { rejectUnauthorized: false } 
    : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false)
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: async (text, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await pool.query(text, params);
      } catch (error) {
        if ((error.code === 'EAI_AGAIN' || error.message.includes('EAI_AGAIN')) && i < retries - 1) {
          console.warn(`DNS resolution error (EAI_AGAIN). Retrying query... (${i + 1}/${retries})`);
          await new Promise(res => setTimeout(res, 1000 * (i + 1))); // Exponential backoff
        } else {
          throw error;
        }
      }
    }
  },
  getClient: () => pool.connect(), // Useful for transactions
  pool: pool // Expose the pool directly if needed
};
