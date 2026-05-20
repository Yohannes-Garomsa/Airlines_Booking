const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
  try {
    console.log('Seeding reference tables (airlines and aircraft)...');

    // 1. Clear existing flight records in a safe order (due to foreign key constraints)
    await pool.query('DELETE FROM flights CASCADE');
    await pool.query('DELETE FROM aircraft CASCADE');
    await pool.query('DELETE FROM airlines CASCADE');

    // 2. Seed Airlines
    const emirates = await pool.query(
      "INSERT INTO airlines (name, iata_code, country) VALUES ('Emirates', 'EK', 'UAE') RETURNING id"
    );
    const qatar = await pool.query(
      "INSERT INTO airlines (name, iata_code, country) VALUES ('Qatar Airways', 'QR', 'Qatar') RETURNING id"
    );
    const singapore = await pool.query(
      "INSERT INTO airlines (name, iata_code, country) VALUES ('Singapore Airlines', 'SQ', 'Singapore') RETURNING id"
    );

    const emiratesId = emirates.rows[0].id;
    const qatarId = qatar.rows[0].id;
    const singaporeId = singapore.rows[0].id;

    // 3. Seed Aircraft Fleet
    const boeing = await pool.query(
      "INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status) VALUES ('Boeing 777-300ER', 'A6-EGZ', 310, 42, 'Active') RETURNING id"
    );
    const a350 = await pool.query(
      "INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status) VALUES ('Airbus A350-900', 'A7-ALF', 247, 36, 'Active') RETURNING id"
    );
    const a380 = await pool.query(
      "INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status) VALUES ('Airbus A380-800', '9V-SKU', 343, 76, 'Active') RETURNING id"
    );

    const boeingId = boeing.rows[0].id;
    const a350Id = a350.rows[0].id;
    const a380Id = a380.rows[0].id;

    // 4. Resolve Airport IDs by IATA Code (from seedAirports.js)
    const airportsRes = await pool.query("SELECT id, iata_code FROM airports");
    const airportsMap = {};
    airportsRes.rows.forEach(row => {
      airportsMap[row.iata_code] = row.id;
    });

    const dxbId = airportsMap['DXB'];
    const jfkId = airportsMap['JFK'];
    const dohId = airportsMap['DOH'];
    const lhrId = airportsMap['LHR'];
    const sinId = airportsMap['SIN'];
    const hndId = airportsMap['HND'];

    if (!dxbId || !jfkId || !dohId || !lhrId || !sinId || !hndId) {
      console.warn("Warning: Some IATA codes not found in airports table. Please make sure seedAirports.js has run.");
    }

    console.log('Seeding flights...');

    const sampleFlights = [
      {
        airline_id: emiratesId,
        flight_number: 'EK-201',
        departure_airport_id: dxbId || 1,
        arrival_airport_id: jfkId || 3,
        departure_time: new Date(Date.now() + 86400000 * 2), // 2 days from now
        arrival_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 14), // 14 hours later
        economy_price: 1250.00,
        economy_seats: 150,
        business_seats: 30,
        available_seats: 180,
        aircraft_id: boeingId,
      },
      {
        airline_id: qatarId,
        flight_number: 'QR-007',
        departure_airport_id: dohId || 7,
        arrival_airport_id: lhrId || 2,
        departure_time: new Date(Date.now() + 86400000 * 5), // 5 days from now
        arrival_time: new Date(Date.now() + 86400000 * 5 + 3600000 * 7), // 7 hours later
        economy_price: 850.00,
        economy_seats: 120,
        business_seats: 20,
        available_seats: 140,
        aircraft_id: a350Id,
      },
      {
        airline_id: singaporeId,
        flight_number: 'SQ-638',
        departure_airport_id: sinId || 5,
        arrival_airport_id: hndId || 4,
        departure_time: new Date(Date.now() + 86400000 * 10), // 10 days from now
        arrival_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 6), // 6 hours later
        economy_price: 600.00,
        economy_seats: 100,
        business_seats: 15,
        available_seats: 115,
        aircraft_id: a380Id,
      }
    ];

    for (const flight of sampleFlights) {
      await pool.query(
        `INSERT INTO flights (
          airline_id, flight_number, departure_airport_id, arrival_airport_id, 
          departure_time, arrival_time, economy_price, 
          economy_seats, business_seats, available_seats, aircraft_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          flight.airline_id, flight.flight_number, flight.departure_airport_id, flight.arrival_airport_id,
          flight.departure_time, flight.arrival_time, flight.economy_price,
          flight.economy_seats, flight.business_seats, flight.available_seats, flight.aircraft_id
        ]
      );
    }

    console.log('Sample flights seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding flights:', err);
    process.exit(1);
  }
};

seed();
