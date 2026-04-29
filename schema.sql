-- Schema for Airline Booking System

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flights Table
CREATE TABLE flights (
    id SERIAL PRIMARY KEY,
    airline VARCHAR(100) NOT NULL,
    departure_city VARCHAR(100) NOT NULL,
    arrival_city VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    seats_available INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    flight_id INTEGER REFERENCES flights(id),
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Passengers Table
CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample Data
INSERT INTO flights (airline, departure_city, arrival_city, departure_time, arrival_time, price, seats_available)
VALUES 
('SkyBound Airlines', 'New York', 'London', '2026-06-01 10:00:00+00', '2026-06-01 22:00:00+00', 450.00, 150),
('Global Air', 'Paris', 'Tokyo', '2026-06-02 08:00:00+00', '2026-06-03 04:00:00+00', 850.00, 120),
('Star Travel', 'Dubai', 'New York', '2026-06-03 14:00:00+00', '2026-06-04 02:00:00+00', 700.00, 200);
