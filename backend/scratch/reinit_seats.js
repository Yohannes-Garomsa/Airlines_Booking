const Seat = require('../models/seatModel');
const db = require('../config/db');

async function reinit() {
  const flights = await db.query('SELECT id FROM flights');
  for (const f of flights.rows) {
    console.log(`Initializing seats for flight ${f.id}...`);
    await Seat.initialize(f.id);
  }
  process.exit(0);
}

reinit();
