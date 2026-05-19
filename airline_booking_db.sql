-- =============================================================================
--  AIRLINE BOOKING SYSTEM — NORMALIZED MASTER DATABASE SCHEMA
--  File: airline_booking_db.sql
--  Standard: Third Normal Form (3NF) + BCNF + Domain Integrity
--
--  Normalization changelog vs previous version:
--    [FIX-1] Added `airlines` table — airline name was a repeating VARCHAR
--            in flights (3NF violation). Now flights.airline_id is a FK.
--    [FIX-2] `flights.business_price` is now GENERATED ALWAYS AS
--            (economy_price * 1.10) STORED — was a redundant computed column.
--    [FIX-3] `flights.total_seats` is now GENERATED ALWAYS AS
--            (economy_seats + business_seats) STORED — was a computed column.
--    [FIX-4] Removed `flights.departure_city` / `arrival_city` — were
--            transitively dependent on airport FKs (3NF violation).
--            City is now derived by JOIN to airports.
--    [FIX-5] Added `tickets.passenger_id` FK to `passengers` — passenger_name
--            and passenger_email in tickets had no FK integrity.
--    [FIX-6] Added CHECK constraints on all enum-like VARCHAR columns
--            (status, role, priority, cabin_class, seat_class) for domain integrity.
--    [FIX-7] Made critical FK columns NOT NULL where business logic requires it.
--    [FIX-8] `available_seats` kept intentionally as a denormalized performance
--            counter (standard practice in high-traffic booking systems).
--    [FIX-9] `gate`/`terminal` in tickets kept intentionally as a point-in-time
--            snapshot (boarding pass must not change if flight gate changes).
--
--  Usage:
--    psql -U <user> -d <database> -f airline_booking_db.sql
--    node backend/migrate.js ../airline_booking_db.sql
-- =============================================================================


-- =============================================================================
-- SECTION 1: DROP ALL OBJECTS (clean slate — FK-safe order)
-- =============================================================================

DROP TABLE IF EXISTS tickets        CASCADE;
DROP TABLE IF EXISTS notifications  CASCADE;
DROP TABLE IF EXISTS payments       CASCADE;
DROP TABLE IF EXISTS seats          CASCADE;
DROP TABLE IF EXISTS passengers     CASCADE;
DROP TABLE IF EXISTS bookings       CASCADE;
DROP TABLE IF EXISTS routes         CASCADE;
DROP TABLE IF EXISTS flights        CASCADE;
DROP TABLE IF EXISTS aircraft       CASCADE;
DROP TABLE IF EXISTS airports       CASCADE;
DROP TABLE IF EXISTS airlines       CASCADE;
DROP TABLE IF EXISTS users          CASCADE;


-- =============================================================================
-- SECTION 2: INDEPENDENT / LOOKUP TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- [FIX-1] TABLE: airlines
--   Extracted from flights.airline (VARCHAR) to eliminate repeating groups.
--   Each airline is stored once; flights reference it via airline_id.
-- -----------------------------------------------------------------------------
CREATE TABLE airlines (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    iata_code   VARCHAR(2)   UNIQUE,          -- e.g. 'ET', 'EK', 'QR'
    country     VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: users
--   All system users: passengers, admins, superadmins.
--   role CHECK enforces domain integrity without a separate lookup table.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'user'
                    CHECK (role IN ('user', 'admin', 'superadmin')),
    is_blocked  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: airports
--   Master list of airports. IATA code is the natural business key.
-- -----------------------------------------------------------------------------
CREATE TABLE airports (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL,
    iata_code   VARCHAR(3)   NOT NULL UNIQUE,
    icao_code   VARCHAR(4)   UNIQUE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: aircraft
--   Fleet of physical aircraft.
--   status CHECK enforces only valid operational states.
-- -----------------------------------------------------------------------------
CREATE TABLE aircraft (
    id                  SERIAL      PRIMARY KEY,
    model               VARCHAR(100) NOT NULL,
    tail_number         VARCHAR(20)  NOT NULL UNIQUE,
    economy_capacity    INTEGER      NOT NULL CHECK (economy_capacity > 0),
    business_capacity   INTEGER      NOT NULL CHECK (business_capacity >= 0),
    status              VARCHAR(20)  NOT NULL DEFAULT 'Active'
                            CHECK (status IN ('Active', 'Maintenance', 'Grounded')),
    last_maintenance    DATE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- SECTION 3: DEPENDENT TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: routes
--   Known origin → destination pairs. Stores physical distance and typical
--   duration independently of any specific flight schedule.
--   UNIQUE constraint prevents duplicate route definitions.
-- -----------------------------------------------------------------------------
CREATE TABLE routes (
    id                      SERIAL PRIMARY KEY,
    origin_airport_id       INTEGER NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
    destination_airport_id  INTEGER NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
    distance_km             DECIMAL(10, 2) CHECK (distance_km > 0),
    base_duration_minutes   INTEGER        CHECK (base_duration_minutes > 0),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(origin_airport_id, destination_airport_id),
    CHECK (origin_airport_id <> destination_airport_id)
);

-- -----------------------------------------------------------------------------
-- TABLE: flights
--   Core operational schedule table.
--
--   [FIX-1] airline_id FK replaces the repeating airline VARCHAR column.
--   [FIX-2] business_price is GENERATED — always economy_price * 1.10.
--           No application code can accidentally diverge from this rule.
--   [FIX-3] total_seats is GENERATED — always economy_seats + business_seats.
--   [FIX-4] departure_city / arrival_city REMOVED — derive via JOIN to airports.
--   available_seats: intentional denormalized counter (performance-critical).
--   gate / terminal: operational assignment, not derivable from other tables.
--
--   status CHECK enforces only known flight states.
-- -----------------------------------------------------------------------------
CREATE TABLE flights (
    id                      SERIAL PRIMARY KEY,

    -- [FIX-1] Reference to airlines lookup table
    airline_id              INTEGER      NOT NULL REFERENCES airlines(id) ON DELETE RESTRICT,
    flight_number           VARCHAR(20)  NOT NULL,

    -- Airport references — city names derived by JOIN (no denormalized copies)
    departure_airport_id    INTEGER      NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
    arrival_airport_id      INTEGER      NOT NULL REFERENCES airports(id) ON DELETE RESTRICT,
    CHECK (departure_airport_id <> arrival_airport_id),

    departure_time          TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time            TIMESTAMP WITH TIME ZONE NOT NULL,
    CHECK (arrival_time > departure_time),

    -- Pricing
    economy_price           DECIMAL(10, 2) NOT NULL CHECK (economy_price > 0),

    -- [FIX-2] Derived column — stored for query performance, always consistent
    business_price          DECIMAL(10, 2) GENERATED ALWAYS AS
                                (ROUND(economy_price * 1.10, 2)) STORED,

    -- Seat inventory
    economy_seats           INTEGER NOT NULL DEFAULT 153 CHECK (economy_seats >= 0),
    business_seats          INTEGER NOT NULL DEFAULT 27  CHECK (business_seats >= 0),

    -- [FIX-3] Derived column — always consistent, no manual sync needed
    total_seats             INTEGER GENERATED ALWAYS AS
                                (economy_seats + business_seats) STORED,

    -- Denormalized counter (intentional — updated atomically on booking)
    available_seats         INTEGER NOT NULL DEFAULT 180 CHECK (available_seats >= 0),

    -- Operational status
    status                  VARCHAR(20) NOT NULL DEFAULT 'Scheduled'
                                CHECK (status IN ('Scheduled','Boarding','In-Air','Delayed','Landed','Cancelled')),
    gate                    VARCHAR(10),
    terminal                VARCHAR(5),
    delay_minutes           INTEGER NOT NULL DEFAULT 0 CHECK (delay_minutes >= 0),

    -- Fleet & route assignment
    aircraft_id             INTEGER REFERENCES aircraft(id) ON DELETE SET NULL,
    route_id                INTEGER REFERENCES routes(id)   ON DELETE SET NULL,

    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: bookings
--   Links a user to a flight for a specific cabin class.
--   PNR: 6-char uppercase alphanumeric, unique booking reference.
--   cabin_class CHECK aligns with seat classes.
-- -----------------------------------------------------------------------------
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER      NOT NULL REFERENCES users(id)   ON DELETE RESTRICT,
    flight_id       INTEGER      NOT NULL REFERENCES flights(id)  ON DELETE RESTRICT,
    total_price     DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
    cabin_class     VARCHAR(20)  NOT NULL DEFAULT 'Economy'
                        CHECK (cabin_class IN ('Economy', 'Business')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','cancelled','completed')),
    pnr             VARCHAR(6)   NOT NULL UNIQUE,
    booking_date    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: passengers
--   Individual travellers on a booking. One booking = one or more passengers.
-- -----------------------------------------------------------------------------
CREATE TABLE passengers (
    id          SERIAL PRIMARY KEY,
    booking_id  INTEGER      NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: payments
--   One payment record per confirmed booking.
--   transaction_id is the external gateway reference — must be unique.
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
    id              SERIAL PRIMARY KEY,
    booking_id      INTEGER        NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    amount          DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_method  VARCHAR(50),
    status          VARCHAR(20)    NOT NULL DEFAULT 'completed'
                        CHECK (status IN ('completed','failed','refunded')),
    transaction_id  VARCHAR(100)   NOT NULL UNIQUE,
    payment_date    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: seats
--   Physical seat map per flight. Initialized when a flight is created.
--   seat_class CHECK matches the cabin_class domain in bookings.
-- -----------------------------------------------------------------------------
CREATE TABLE seats (
    id          SERIAL PRIMARY KEY,
    flight_id   INTEGER     NOT NULL REFERENCES flights(id)   ON DELETE CASCADE,
    booking_id  INTEGER              REFERENCES bookings(id)  ON DELETE SET NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class  VARCHAR(20) NOT NULL DEFAULT 'Economy'
                    CHECK (seat_class IN ('Economy', 'Business')),
    is_occupied BOOLEAN     NOT NULL DEFAULT FALSE,
    UNIQUE(flight_id, seat_number)
);

-- -----------------------------------------------------------------------------
-- TABLE: tickets
--   E-ticket / boarding pass generated after payment is confirmed.
--   One ticket per passenger per booking.
--
--   [FIX-5] passenger_id FK added — links ticket to specific passenger.
--   gate / terminal kept as point-in-time snapshot (boarding pass integrity).
--   passenger_name / passenger_email kept as immutable snapshot for the same
--   reason — ticket must not change if passenger record is later updated.
-- -----------------------------------------------------------------------------
CREATE TABLE tickets (
    id               SERIAL PRIMARY KEY,
    ticket_number    VARCHAR(13)  NOT NULL UNIQUE,
    booking_id       INTEGER      NOT NULL REFERENCES bookings(id)   ON DELETE CASCADE,

    -- [FIX-5] Direct FK to the specific passenger this ticket covers
    passenger_id     INTEGER               REFERENCES passengers(id) ON DELETE SET NULL,

    -- Immutable boarding pass snapshot (intentional denormalization)
    passenger_name   VARCHAR(255) NOT NULL,
    passenger_email  VARCHAR(255),
    seat_number      VARCHAR(10),
    gate             VARCHAR(10),
    terminal         VARCHAR(5),
    boarding_time    TIMESTAMP WITH TIME ZONE,
    qr_code_data     TEXT,

    status           VARCHAR(20)  NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active','used','cancelled')),
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- TABLE: notifications
--   Persistent admin-facing operational alerts stored in the database.
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
    id          SERIAL      PRIMARY KEY,
    type        VARCHAR(50) NOT NULL
                    CHECK (type IN ('Delay','Cancellation','System','Booking','capacity','maintenance')),
    message     TEXT        NOT NULL,
    priority    VARCHAR(20) NOT NULL DEFAULT 'low'
                    CHECK (priority IN ('low','medium','high','critical')),
    is_read     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================================
-- SECTION 4: PERFORMANCE INDEXES
-- =============================================================================

-- Airlines
CREATE INDEX idx_airlines_iata           ON airlines(iata_code);

-- Airports
CREATE INDEX idx_airports_iata           ON airports(iata_code);
CREATE INDEX idx_airports_search         ON airports(name, city, iata_code);

-- Flights — search & filter paths
CREATE INDEX idx_flights_airline         ON flights(airline_id);
CREATE INDEX idx_flights_dep_airport     ON flights(departure_airport_id);
CREATE INDEX idx_flights_arr_airport     ON flights(arrival_airport_id);
CREATE INDEX idx_flights_dep_time        ON flights(departure_time);
CREATE INDEX idx_flights_economy_price   ON flights(economy_price);
CREATE INDEX idx_flights_status          ON flights(status);
CREATE INDEX idx_flights_aircraft        ON flights(aircraft_id);
CREATE INDEX idx_flights_route           ON flights(route_id);

-- Composite — most common search (origin + destination + date)
CREATE INDEX idx_flights_airport_pair_time
    ON flights(departure_airport_id, arrival_airport_id, departure_time);

-- Bookings
CREATE INDEX idx_bookings_user           ON bookings(user_id);
CREATE INDEX idx_bookings_flight         ON bookings(flight_id);
CREATE INDEX idx_bookings_status         ON bookings(status);
CREATE INDEX idx_bookings_pnr            ON bookings(pnr);
CREATE INDEX idx_bookings_date           ON bookings(booking_date);

-- Passengers
CREATE INDEX idx_passengers_booking      ON passengers(booking_id);

-- Payments
CREATE INDEX idx_payments_booking        ON payments(booking_id);
CREATE INDEX idx_payments_transaction    ON payments(transaction_id);

-- Seats
CREATE INDEX idx_seats_flight            ON seats(flight_id);
CREATE INDEX idx_seats_booking           ON seats(booking_id);

-- Tickets
CREATE INDEX idx_tickets_booking         ON tickets(booking_id);
CREATE INDEX idx_tickets_passenger       ON tickets(passenger_id);
CREATE INDEX idx_tickets_number          ON tickets(ticket_number);

-- Notifications
CREATE INDEX idx_notifications_read      ON notifications(is_read);
CREATE INDEX idx_notifications_priority  ON notifications(priority);


-- =============================================================================
-- SECTION 5: SEED DATA — AIRLINES
-- =============================================================================

INSERT INTO airlines (name, iata_code, country) VALUES
    ('Ethiopian Airlines',    'ET', 'Ethiopia'),
    ('Emirates',              'EK', 'UAE'),
    ('Qatar Airways',         'QR', 'Qatar'),
    ('Singapore Airlines',    'SQ', 'Singapore'),
    ('Turkish Airlines',      'TK', 'Turkey'),
    ('Lufthansa',             'LH', 'Germany'),
    ('British Airways',       'BA', 'United Kingdom'),
    ('Air France',            'AF', 'France'),
    ('Cathay Pacific',        'CX', 'Hong Kong'),
    ('Kenya Airways',         'KQ', 'Kenya')
ON CONFLICT (name) DO NOTHING;


-- =============================================================================
-- SECTION 6: SEED DATA — AIRPORTS (15 major hubs)
-- =============================================================================

INSERT INTO airports (name, city, country, iata_code, icao_code) VALUES
    ('Dubai International Airport',                 'Dubai',       'UAE',            'DXB', 'OMDB'),
    ('London Heathrow Airport',                     'London',      'United Kingdom', 'LHR', 'EGLL'),
    ('John F. Kennedy International Airport',       'New York',    'USA',            'JFK', 'KJFK'),
    ('Haneda Airport',                              'Tokyo',       'Japan',          'HND', 'RJTT'),
    ('Singapore Changi Airport',                    'Singapore',   'Singapore',      'SIN', 'WSSS'),
    ('Charles de Gaulle Airport',                   'Paris',       'France',         'CDG', 'LFPG'),
    ('Hamad International Airport',                 'Doha',        'Qatar',          'DOH', 'OTHH'),
    ('Istanbul Airport',                            'Istanbul',    'Turkey',         'IST', 'LTFM'),
    ('Los Angeles International Airport',           'Los Angeles', 'USA',            'LAX', 'KLAX'),
    ('Hong Kong International Airport',             'Hong Kong',   'China',          'HKG', 'VHHH'),
    ('Addis Ababa Bole International Airport',      'Addis Ababa', 'Ethiopia',       'ADD', 'HAAB'),
    ('Nairobi Jomo Kenyatta International Airport', 'Nairobi',     'Kenya',          'NBO', 'HKJK'),
    ('Cairo International Airport',                'Cairo',        'Egypt',          'CAI', 'HECA'),
    ('Frankfurt Airport',                           'Frankfurt',   'Germany',        'FRA', 'EDDF'),
    ('Amsterdam Airport Schiphol',                  'Amsterdam',   'Netherlands',    'AMS', 'EHAM')
ON CONFLICT (iata_code) DO NOTHING;


-- =============================================================================
-- SECTION 7: SEED DATA — AIRCRAFT FLEET
-- =============================================================================

INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status) VALUES
    ('Boeing 787 Dreamliner', 'N787SB', 242, 35, 'Active'),
    ('Airbus A350-900',       'F-HTYA', 280, 40, 'Active'),
    ('Boeing 737 MAX 8',      'N172SQ', 160, 16, 'Active'),
    ('Airbus A320neo',        'ET-AVJ', 150, 12, 'Active'),
    ('Boeing 777-300ER',      'A7-BAC', 304, 42, 'Active')
ON CONFLICT (tail_number) DO NOTHING;


-- =============================================================================
-- SECTION 8: SEED DATA — DEFAULT SUPERADMIN
--   !! Change this password immediately in production !!
--   Regenerate hash via: node backend/makeSuperAdmin.js
-- =============================================================================

INSERT INTO users (name, email, password, role) VALUES
    (
        'Super Admin',
        'superadmin@skybound.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh',
        'superadmin'
    )
ON CONFLICT (email) DO NOTHING;


-- =============================================================================
-- SECTION 9: BACKEND MIGRATION NOTE
-- =============================================================================
--
--  The following backend model files need a one-time update to work with
--  the normalized schema:
--
--  1. flightModel.js — INSERT/UPDATE must:
--       - Accept airline_id instead of airline (VARCHAR)
--       - Remove departure_city / arrival_city from INSERT (now via JOIN)
--       - Remove business_price / total_seats from INSERT (GENERATED columns)
--
--  2. Queries that SELECT departure_city / arrival_city must JOIN airports:
--       JOIN airports da ON f.departure_airport_id = da.id  -> da.city
--       JOIN airports aa ON f.arrival_airport_id   = aa.id  -> aa.city
--
--  3. ticketModel.js — INSERT must include passenger_id.
--
--  All other tables (bookings, passengers, payments, seats, notifications)
--  are backwards-compatible with the normalized schema.
--
-- =============================================================================
-- END OF airline_booking_db.sql
-- =============================================================================
