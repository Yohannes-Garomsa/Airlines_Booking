const db = require('./config/db');

const airports = [
  { name: 'Dubai International Airport', city: 'Dubai', country: 'UAE', iata: 'DXB', icao: 'OMDB' },
  { name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', iata: 'LHR', icao: 'EGLL' },
  { name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA', iata: 'JFK', icao: 'KJFK' },
  { name: 'Haneda Airport', city: 'Tokyo', country: 'Japan', iata: 'HND', icao: 'RJTT' },
  { name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', iata: 'SIN', icao: 'WSSS' },
  { name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', iata: 'CDG', icao: 'LFPG' },
  { name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', iata: 'DOH', icao: 'OTHH' },
  { name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', iata: 'IST', icao: 'LTFM' },
  { name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA', iata: 'LAX', icao: 'KLAX' },
  { name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'China', iata: 'HKG', icao: 'VHHH' }
];

async function seedAirports() {
  console.log('Seeding airports...');
  for (const a of airports) {
    try {
      await db.query(
        'INSERT INTO airports (name, city, country, iata_code, icao_code) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (iata_code) DO NOTHING',
        [a.name, a.city, a.country, a.iata, a.icao]
      );
    } catch (err) {
      console.error(`Failed to seed ${a.iata}:`, err.message);
    }
  }
  console.log('Airports seeded successfully.');
  process.exit();
}

seedAirports();
