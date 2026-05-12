const db = require('../config/db');

async function checkAirportsSchema() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'airports'");
    console.log('Columns in airports table:');
    res.rows.forEach(row => console.log(`- ${row.column_name}`));
    process.exit(0);
  } catch (err) {
    console.error('Error checking airports schema:', err);
    process.exit(1);
  }
}

checkAirportsSchema();
