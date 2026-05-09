require('dotenv').config({ path: './backend/.env' });
const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  try {
    const sqlPath = path.join(__dirname, 'migration_v4.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running Migration V4...');
    await db.query(sql);
    console.log('Migration V4 completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
