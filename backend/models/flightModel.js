const db = require('../config/db');

const Flight = {
  create: async (flightData) => {
    const { 
      airline, 
      flight_number,
      departure_airport_id, 
      arrival_airport_id, 
      departure_time, 
      arrival_time, 
      economy_price, 
      total_seats: provided_total_seats,
      aircraft_id,
      status,
      gate,
      terminal
    } = flightData;

    // Fetch city names from airports table for redundant legacy columns
    const departureAirport = await db.query('SELECT city FROM airports WHERE id = $1', [departure_airport_id]);
    const arrivalAirport = await db.query('SELECT city FROM airports WHERE id = $1', [arrival_airport_id]);
    
    const departure_city = departureAirport.rows[0]?.city || 'Unknown';
    const arrival_city = arrivalAirport.rows[0]?.city || 'Unknown';

    // Split total seats
    let economy_seats, business_seats, total_seats;

    if (aircraft_id) {
      const aircraft = await db.query('SELECT economy_capacity, business_capacity FROM aircraft WHERE id = $1', [aircraft_id]);
      if (aircraft.rows.length > 0) {
        economy_seats = aircraft.rows[0].economy_capacity;
        business_seats = aircraft.rows[0].business_capacity;
        total_seats = economy_seats + business_seats;
      } else {
        // Fallback to manual split if aircraft not found (shouldn't happen with FK)
        total_seats = provided_total_seats || 180;
        economy_seats = Math.floor(total_seats * 0.85);
        business_seats = total_seats - economy_seats;
      }
    } else {
      total_seats = provided_total_seats || 180;
      economy_seats = Math.floor(total_seats * 0.85);
      business_seats = total_seats - economy_seats;
    }

    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);

    const result = await db.query(
      `INSERT INTO flights 
       (airline, flight_number, departure_city, arrival_city, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats, total_seats, available_seats, aircraft_id, status, gate, terminal) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [airline, flight_number, departure_city, arrival_city, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats, total_seats, total_seats, aircraft_id, status || 'Scheduled', gate, terminal]
    );
    return result.rows[0];
  },

  getAll: async () => {
    const result = await db.query(`
      SELECT f.*, 
             da.name as departure_airport_name, da.city as departure_city, da.iata_code as departure_iata,
             aa.name as arrival_airport_name, aa.city as arrival_city, aa.iata_code as arrival_iata,
             air.model as aircraft_model, air.tail_number
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
      LEFT JOIN aircraft air ON f.aircraft_id = air.id
      ORDER BY f.departure_time ASC
    `);
    return result.rows;
  },

  search: async (filters) => {
    const { departure_city, arrival_city, departure_date, max_price, max_duration, sort_by, limit = 10, page = 1 } = filters;
    
    // Calculate duration in hours in the SELECT statement
    let query = `
      SELECT f.*, 
             da.name as departure_airport_name, da.city as departure_city, da.iata_code as departure_iata,
             aa.name as arrival_airport_name, aa.city as arrival_city, aa.iata_code as arrival_iata,
             air.model as aircraft_model, air.tail_number,
             EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 as duration 
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
      LEFT JOIN aircraft air ON f.aircraft_id = air.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (departure_city) {
      query += ` AND (da.city ILIKE $${paramIndex} OR da.name ILIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${departure_city}%`);
    }
    if (arrival_city) {
      query += ` AND (aa.city ILIKE $${paramIndex} OR aa.name ILIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${arrival_city}%`);
    }
    if (departure_date) {
      query += ` AND DATE(f.departure_time) = $${paramIndex++}`;
      params.push(departure_date);
    }
    if (max_price) {
      query += ` AND f.economy_price <= $${paramIndex++}`;
      params.push(max_price);
    }
    if (max_duration) {
      query += ` AND EXTRACT(EPOCH FROM (f.arrival_time - f.departure_time))/3600 <= $${paramIndex++}`;
      params.push(max_duration);
    }

    // Sorting logic
    let orderBy = 'f.departure_time ASC';
    if (sort_by === 'price_low') orderBy = 'f.economy_price ASC';
    else if (sort_by === 'price_high') orderBy = 'f.economy_price DESC';
    else if (sort_by === 'duration_short') orderBy = 'duration ASC';
    else if (sort_by === 'time_late') orderBy = 'f.departure_time DESC';

    query += ` ORDER BY ${orderBy}`;

    const offset = (page - 1) * limit;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    return result.rows;
  },
  
  getById: async (id) => {
    const result = await db.query(`
      SELECT f.*, air.model as aircraft_model, air.tail_number
      FROM flights f
      LEFT JOIN aircraft air ON f.aircraft_id = air.id
      WHERE f.id = $1
    `, [id]);
    return result.rows[0];
  },

  update: async (id, flightData) => {
    const { 
      airline, 
      flight_number,
      departure_airport_id, 
      arrival_airport_id, 
      departure_time, 
      arrival_time, 
      economy_price, 
      total_seats: provided_total_seats,
      aircraft_id,
      status,
      gate,
      terminal
    } = flightData;

    // Fetch city names from airports table for redundant legacy columns
    const departureAirport = await db.query('SELECT city FROM airports WHERE id = $1', [departure_airport_id]);
    const arrivalAirport = await db.query('SELECT city FROM airports WHERE id = $1', [arrival_airport_id]);
    
    const departure_city = departureAirport.rows[0]?.city || 'Unknown';
    const arrival_city = arrivalAirport.rows[0]?.city || 'Unknown';

    // Split total seats
    let economy_seats, business_seats, total_seats;

    if (aircraft_id) {
      const aircraft = await db.query('SELECT economy_capacity, business_capacity FROM aircraft WHERE id = $1', [aircraft_id]);
      if (aircraft.rows.length > 0) {
        economy_seats = aircraft.rows[0].economy_capacity;
        business_seats = aircraft.rows[0].business_capacity;
        total_seats = economy_seats + business_seats;
      } else {
        total_seats = provided_total_seats || 180;
        economy_seats = Math.floor(total_seats * 0.85);
        business_seats = total_seats - economy_seats;
      }
    } else {
      total_seats = provided_total_seats || 180;
      economy_seats = Math.floor(total_seats * 0.85);
      business_seats = total_seats - economy_seats;
    }

    // Real Business Rule: Business price is 10% greater than economy price
    const business_price = (parseFloat(economy_price) * 1.1).toFixed(2);

    const result = await db.query(
      `UPDATE flights SET 
       airline = $1, flight_number = $2, departure_city = $3, arrival_city = $4, 
       departure_airport_id = $5, arrival_airport_id = $6, 
       departure_time = $7, arrival_time = $8, economy_price = $9, business_price = $10, 
       economy_seats = $11, business_seats = $12, total_seats = $13, available_seats = $13,
       aircraft_id = $14, status = $15, gate = $16, terminal = $17
       WHERE id = $18 RETURNING *`,
      [airline, flight_number, departure_city, arrival_city, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price, business_price, economy_seats, business_seats, total_seats, aircraft_id, status, gate, terminal, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM flights WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  getCities: async () => {
    const result = await db.query('SELECT DISTINCT city FROM airports ORDER BY city ASC');
    return result.rows.map(r => r.city);
  },

  getOrigins: async () => {
    const result = await db.query(`
      SELECT DISTINCT a.city 
      FROM airports a
      JOIN flights f ON f.departure_airport_id = a.id
      ORDER BY a.city ASC
    `);
    return result.rows.map(r => r.city);
  },

  getDestinations: async (originCity) => {
    let query = `
      SELECT DISTINCT aa.city 
      FROM flights f
      JOIN airports da ON f.departure_airport_id = da.id
      JOIN airports aa ON f.arrival_airport_id = aa.id
    `;
    const params = [];
    if (originCity) {
      query += ' WHERE da.city = $1';
      params.push(originCity);
    }
    query += ' ORDER BY aa.city ASC';
    const result = await db.query(query, params);
    return result.rows.map(r => r.city);
  }
};

module.exports = Flight;
