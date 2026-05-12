const db = require('../config/db');

async function checkForeignKeys() {
  try {
    const res = await db.query("SELECT id, departure_airport_id, arrival_airport_id FROM flights");
    console.log('Flight FK Check:');
    for (const row of res.rows) {
      const depRes = await db.query("SELECT id FROM airports WHERE id = $1", [row.departure_airport_id]);
      const arrRes = await db.query("SELECT id FROM airports WHERE id = $1", [row.arrival_airport_id]);
      console.log(`Flight ${row.id}: DepID ${row.departure_airport_id} (${depRes.rows.length ? 'Valid' : 'INVALID'}), ArrID ${row.arrival_airport_id} (${arrRes.rows.length ? 'Valid' : 'INVALID'})`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error checking FKs:', err);
    process.exit(1);
  }
}

checkForeignKeys();
