-- Migration V4: Fleet, Routes, and Notifications

-- 1. Ensure airports table exists (fallback if not already created)
CREATE TABLE IF NOT EXISTS airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    iata_code VARCHAR(3) UNIQUE NOT NULL,
    icao_code VARCHAR(4) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create aircraft table
CREATE TABLE IF NOT EXISTS aircraft (
    id SERIAL PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    tail_number VARCHAR(20) UNIQUE NOT NULL,
    economy_capacity INTEGER NOT NULL,
    business_capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Active', -- Active, Maintenance, Grounded
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    origin_airport_id INTEGER REFERENCES airports(id),
    destination_airport_id INTEGER REFERENCES airports(id),
    distance_km DECIMAL(10, 2),
    base_duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(origin_airport_id, destination_airport_id)
);

-- 4. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- Delay, Cancellation, System, Booking
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Update flights table
ALTER TABLE flights ADD COLUMN IF NOT EXISTS aircraft_id INTEGER REFERENCES aircraft(id);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS route_id INTEGER REFERENCES routes(id);
ALTER TABLE flights ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Scheduled'; -- Scheduled, Boarding, Departed, Landed, Delayed, Cancelled
ALTER TABLE flights ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0;

-- 6. Seed some initial aircraft
INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status)
VALUES 
('Boeing 787 Dreamliner', 'N787SB', 242, 35, 'Active'),
('Airbus A350-900', 'F-HTYA', 280, 40, 'Active'),
('Boeing 737 MAX 8', 'N172SQ', 160, 16, 'Active')
ON CONFLICT (tail_number) DO NOTHING;
