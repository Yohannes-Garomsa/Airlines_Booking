require('dotenv').config();
const db = require('./config/db');

async function resetPassengerTable() {
  const dropQuery = `DROP TABLE IF EXISTS passengers CASCADE;`;
  
  const createQuery = `
    CREATE TABLE passengers (
      id SERIAL PRIMARY KEY,
      pax_id VARCHAR(20) UNIQUE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      name VARCHAR(255),
      first_name VARCHAR(100),
      middle_name VARCHAR(100),
      last_name VARCHAR(100),
      gender VARCHAR(20),
      date_of_birth DATE,
      flight_type VARCHAR(20),
      document_type VARCHAR(20),
      fan_number VARCHAR(20),
      fin_number VARCHAR(20),
      passport_number VARCHAR(50),
      passport_expiry DATE,
      nationality VARCHAR(100),
      passport_country VARCHAR(100),
      passport_issue_date DATE,
      passport_type VARCHAR(50),
      residence_country VARCHAR(100),
      dual_citizenship BOOLEAN DEFAULT FALSE,
      phone_number VARCHAR(20),
      email VARCHAR(255),
      emergency_contact_name VARCHAR(100),
      emergency_contact_phone VARCHAR(20),
      emergency_relationship VARCHAR(100),
      status VARCHAR(20) DEFAULT 'Pending',
      admin_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await db.query(dropQuery);
    console.log('Old passengers table dropped');
    await db.query(createQuery);
    console.log('New passengers table created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting passengers table:', err);
    process.exit(1);
  }
}

resetPassengerTable();
