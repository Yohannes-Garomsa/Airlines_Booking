const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seedFlights = async () => {
  try {
    console.log('Seeding flights...');
    
    // Clear existing flights (for clean sample)
    await pool.query('DELETE FROM flights');

    const sampleFlights = [
      {
        airline: 'Emirates',
        departure_city: 'Dubai (DXB)',
        arrival_city: 'New York (JFK)',
        departure_time: new Date(Date.now() + 86400000 * 2), // 2 days from now
        arrival_time: new Date(Date.now() + 86400000 * 2 + 3600000 * 14), // 14 hours later
        economy_price: 1250.00,
        business_price: 4500.00,
        economy_seats: 150,
        business_seats: 30
      },
      {
        airline: 'Qatar Airways',
        departure_city: 'Doha (DOH)',
        arrival_city: 'London (LHR)',
        departure_time: new Date(Date.now() + 86400000 * 5), // 5 days from now
        arrival_time: new Date(Date.now() + 86400000 * 5 + 3600000 * 7), // 7 hours later
        economy_price: 850.00,
        business_price: 3200.00,
        economy_seats: 120,
        business_seats: 20
      },
      {
        airline: 'Singapore Airlines',
        departure_city: 'Singapore (SIN)',
        arrival_city: 'Tokyo (HND)',
        departure_time: new Date(Date.now() + 86400000 * 10), // 10 days from now
        arrival_time: new Date(Date.now() + 86400000 * 10 + 3600000 * 6), // 6 hours later
        economy_price: 600.00,
        business_price: 2400.00,
        economy_seats: 100,
        business_seats: 15
      }
    ];

    for (const flight of sampleFlights) {
      await pool.query(
        'INSERT INTO flights (airline, departure_city, arrival_city, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [flight.airline, flight.departure_city, flight.arrival_city, flight.departure_time, flight.arrival_time, flight.economy_price, flight.business_price, flight.economy_seats, flight.business_seats]
      );
    }

    console.log('Sample flights seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding flights:', err);
    process.exit(1);
  }
};

seedFlights();
