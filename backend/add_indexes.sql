-- Index for departure city (fast origin search)
CREATE INDEX IF NOT EXISTS idx_flights_departure_city ON flights(departure_city);

-- Index for arrival city (fast destination search)
CREATE INDEX IF NOT EXISTS idx_flights_arrival_city ON flights(arrival_city);

-- Index for departure time (fast date filtering and sorting)
CREATE INDEX IF NOT EXISTS idx_flights_departure_time ON flights(departure_time);

-- Index for economy price (fast price filtering)
CREATE INDEX IF NOT EXISTS idx_flights_economy_price ON flights(economy_price);

-- Composite index for the most common search pattern
CREATE INDEX IF NOT EXISTS idx_flights_search_basic ON flights(departure_city, arrival_city, departure_time);
