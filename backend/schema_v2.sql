-- Airports Table
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update Flights Table to use Airport References
ALTER TABLE flights ADD COLUMN IF NOT EXISTS flight_number VARCHAR(20);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS departure_airport_id INTEGER REFERENCES airports(id);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS arrival_airport_id INTEGER REFERENCES airports(id);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS total_seats INTEGER DEFAULT 180;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS available_seats INTEGER DEFAULT 180;

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata_code);
CREATE INDEX IF NOT EXISTS idx_airports_search ON airports(name, city, iata_code);
CREATE INDEX IF NOT EXISTS idx_flights_airports ON flights(departure_airport_id, arrival_airport_id);

-- Update users table (if role doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='users' AND COLUMN_NAME='role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;
