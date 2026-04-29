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
    flight_number VARCHAR(10) NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    available_seats INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    flight_id INTEGER REFERENCES flights(id),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_email VARCHAR(100) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'confirmed'
);

-- Sample Data
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, price, available_seats)
VALUES 
('SB101', 'New York', 'London', '2026-06-01 10:00:00+00', '2026-06-01 22:00:00+00', 450.00, 150),
('SB102', 'Paris', 'Tokyo', '2026-06-02 08:00:00+00', '2026-06-03 04:00:00+00', 850.00, 120),
('SB103', 'Dubai', 'New York', '2026-06-03 14:00:00+00', '2026-06-04 02:00:00+00', 700.00, 200);
