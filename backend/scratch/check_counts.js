const db = require('../config/db');

async function checkCounts() {
  try {
    const flights = await db.query("SELECT COUNT(*) FROM flights");
    const airports = await db.query("SELECT COUNT(*) FROM airports");
    console.log(`Flights count: ${flights.rows[0].count}`);
    console.log(`Airports count: ${airports.rows[0].count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error checking counts:', err);
    process.exit(1);
  }
}

checkCounts();
