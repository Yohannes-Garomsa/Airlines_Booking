-- Schema V3: Professional Ticketing
-- Update existing tables
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pnr VARCHAR(6) UNIQUE;
ALTER TABLE flights ADD COLUMN IF NOT EXISTS flight_number VARCHAR(20) DEFAULT 'SB101';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS gate VARCHAR(10) DEFAULT 'B24';
ALTER TABLE flights ADD COLUMN IF NOT EXISTS terminal VARCHAR(5) DEFAULT 'T2';

-- Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(13) UNIQUE NOT NULL,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    passenger_name VARCHAR(255) NOT NULL,
    passenger_email VARCHAR(255),
    seat_number VARCHAR(10),
    gate VARCHAR(10),
    terminal VARCHAR(5),
    boarding_time TIMESTAMP WITH TIME ZONE,
    qr_code_data TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed PNRs for existing bookings if any
UPDATE bookings SET pnr = UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6)) WHERE pnr IS NULL;
