const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// --- Dashboard Stats ---

const getDashboardStats = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM flights) as total_flights,
        (SELECT COUNT(*) FROM flights WHERE status = 'Delayed') as delayed_flights,
        (SELECT COUNT(*) FROM flights WHERE status = 'Cancelled') as cancelled_flights,
        (SELECT COUNT(*) FROM bookings) as total_bookings,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed')) as total_revenue,
        (SELECT COALESCE(AVG(occupancy), 0) FROM (
          SELECT (COUNT(p.id)::float / NULLIF(f.economy_seats + f.business_seats, 0)::float) * 100 as occupancy
          FROM flights f
          LEFT JOIN bookings b ON f.id = b.flight_id AND b.status IN ('confirmed', 'completed')
          LEFT JOIN passengers p ON b.id = p.booking_id
          GROUP BY f.id, f.economy_seats, f.business_seats
        ) as sub) as avg_occupancy
    `);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('DASHBOARD STATS ERROR:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
};

// --- Booking Management ---

const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  await Booking.expireOldPending();
  const bookings = await Booking.getAll(status);
  res.status(200).json(bookings);
});

const getBookingDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const booking = await Booking.getFullBookingDetails(id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  res.status(200).json(booking);
});

// --- User Management ---

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.getAll();
  res.status(200).json(users);
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.getById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const updatedUser = await User.update(id, { is_blocked: !user.is_blocked });
  res.status(200).json(updatedUser);
});

const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await User.getById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Restriction: Registered users shouldn't be promoted to admin
  if (user.role === 'user' && role === 'admin') {
    res.status(400);
    throw new Error('Registered users cannot be promoted to Admin. Use the Add Admin flow to create new staff accounts.');
  }

  if (!['admin', 'user', 'superadmin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Constraint: Max 3 Admins
  if (role === 'admin') {
    const adminCountResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    const currentAdmins = parseInt(adminCountResult.rows[0].count);
    
    if (currentAdmins >= 3) {
      res.status(400);
      throw new Error('Maximum limit of 3 Admins reached. Please demote an existing admin first.');
    }
  }

  const updatedUser = await User.update(id, { role });
  res.status(200).json(updatedUser);
});

// --- Fleet Management ---

const getFleet = asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT a.*, 
           COALESCE(
             (SELECT json_agg(h) FROM (
                SELECT f.id, f.flight_number,
                       da.city AS departure_city, aa.city AS arrival_city,
                       f.departure_time, f.status
                FROM flights f
                JOIN airports da ON f.departure_airport_id = da.id
                JOIN airports aa ON f.arrival_airport_id   = aa.id
                WHERE f.aircraft_id = a.id AND f.departure_time < NOW()
                ORDER BY f.departure_time DESC
                LIMIT 5
             ) h), '[]'
           ) as history,
           COALESCE(
             (SELECT json_build_object(
                'id', f.id, 
                'flight_number', f.flight_number, 
                'departure_city', da.city,
                 'arrival_city',   aa.city, 
                'departure_time', f.departure_time,
                'status', f.status
              )
              FROM flights f
               JOIN airports da ON f.departure_airport_id = da.id
               JOIN airports aa ON f.arrival_airport_id   = aa.id
               WHERE f.aircraft_id = a.id AND f.departure_time >= NOW()
              ORDER BY f.departure_time ASC
              LIMIT 1
             ), NULL
           ) as current_assignment
    FROM aircraft a
    ORDER BY a.model ASC
  `);
  res.status(200).json(result.rows);
});

const getAvailableFleet = asyncHandler(async (req, res) => {
  const { departure_time, arrival_time, exclude_flight_id } = req.query;

  if (!departure_time || !arrival_time) {
    res.status(400);
    throw new Error('Departure and arrival times are required');
  }

  let query = `
    SELECT * FROM aircraft
    WHERE status = 'Active'
    AND id NOT IN (
      SELECT aircraft_id FROM flights
      WHERE aircraft_id IS NOT NULL
      AND status != 'Cancelled'
      AND (
        (departure_time < $2 AND arrival_time > $1)
      )
  `;
  const params = [departure_time, arrival_time];

  if (exclude_flight_id) {
    query += ` AND id != $3`;
    params.push(exclude_flight_id);
  }

  query += ` ) ORDER BY model ASC`;

  const result = await db.query(query, params);
  res.status(200).json(result.rows);
});

const createAircraft = asyncHandler(async (req, res) => {
  const { model, tail_number, economy_capacity, business_capacity, status, last_maintenance } = req.body;
  
  const result = await db.query(
    "INSERT INTO aircraft (model, tail_number, economy_capacity, business_capacity, status, last_maintenance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [model, tail_number, economy_capacity, business_capacity, status || 'Active', last_maintenance]
  );
  res.status(201).json(result.rows[0]);
});

const updateAircraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { model, tail_number, economy_capacity, business_capacity, status, last_maintenance } = req.body;
  
  const result = await db.query(
    "UPDATE aircraft SET model = $1, tail_number = $2, economy_capacity = $3, business_capacity = $4, status = $5, last_maintenance = $6 WHERE id = $7 RETURNING *",
    [model, tail_number, economy_capacity, business_capacity, status, last_maintenance, id]
  );
  
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Aircraft not found');
  }
  
  res.status(200).json(result.rows[0]);
});

const deleteAircraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Basic check to see if aircraft has active flights could go here
  
  const result = await db.query("DELETE FROM aircraft WHERE id = $1 RETURNING *", [id]);
  
  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Aircraft not found');
  }
  
  res.status(200).json({ message: 'Aircraft successfully removed from fleet' });
});

// --- Seat Management ---

const getSeatMatrix = asyncHandler(async (req, res) => {
  const { flightId } = req.params;
  const result = await db.query(`
    SELECT s.*, b.pnr, STRING_AGG(p.name, ', ') as passenger_name
    FROM seats s
    LEFT JOIN bookings b ON s.booking_id = b.id
    LEFT JOIN passengers p ON b.id = p.booking_id
    WHERE s.flight_id = $1
    GROUP BY s.id, b.pnr
    ORDER BY s.seat_number ASC
  `, [flightId]);
  res.status(200).json(result.rows);
});

const toggleAircraftStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const aircraft = await db.query('SELECT status FROM aircraft WHERE id = $1', [id]);
  if (aircraft.rows.length === 0) {
    res.status(404);
    throw new Error('Aircraft not found');
  }
  const newStatus = aircraft.rows[0].status === 'Active' ? 'Maintenance' : 'Active';
  await db.query('UPDATE aircraft SET status = $1 WHERE id = $2', [newStatus, id]);
  res.status(200).json({ message: `Aircraft status updated to ${newStatus}` });
});

const getAnalytics = asyncHandler(async (req, res) => {
  // 1. Top 5 popular routes by booking count
  const popularRoutes = await db.query(`
    SELECT da.city AS departure_city, aa.city AS arrival_city,
           COUNT(b.id) AS booking_count,
           SUM(b.total_price) AS route_revenue
    FROM bookings b
    JOIN flights  f  ON b.flight_id            = f.id
    JOIN airports da ON f.departure_airport_id = da.id
    JOIN airports aa ON f.arrival_airport_id   = aa.id
    GROUP BY da.city, aa.city
    ORDER BY booking_count DESC
    LIMIT 5
  `);


  // 2. Revenue trend â€” daily totals for the last 30 days
  const revenueTrend = await db.query(`
    SELECT DATE_TRUNC('day', booking_date) as day,
           SUM(total_price) as daily_revenue,
           COUNT(id) as daily_bookings
    FROM bookings
    WHERE status = 'confirmed' AND booking_date >= NOW() - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day ASC
  `);

  // 3. Cabin class split (Economy vs Business)
  const cabinSplit = await db.query(`
    SELECT cabin_class, COUNT(id) as count, SUM(total_price) as revenue
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY cabin_class
  `);

  // 4. Booking velocity â€” hourly breakdown for the last 7 days
  const bookingVelocity = await db.query(`
    SELECT DATE_TRUNC('day', booking_date) as day, COUNT(id) as count
    FROM bookings
    WHERE booking_date >= NOW() - INTERVAL '7 days'
    GROUP BY day
    ORDER BY day ASC
  `);

  // 5. Cancellation rate
  const cancellationStats = await db.query(`
    SELECT
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
      COUNT(id) as total
    FROM bookings
  `);

  res.status(200).json({
    popularRoutes: popularRoutes.rows,
    revenueTrend: revenueTrend.rows,
    cabinSplit: cabinSplit.rows,
    bookingVelocity: bookingVelocity.rows,
    cancellationStats: cancellationStats.rows[0]
  });
});


const getPayments = asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT p.*, b.pnr, u.name as user_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    JOIN users u ON b.user_id = u.id
    ORDER BY p.payment_date DESC
  `);
  res.status(200).json(result.rows);
});

const getNotifications = asyncHandler(async (req, res) => {
  // Stored notifications from DB
  let stored = { rows: [] };
  try {
    stored = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
  } catch (err) {
    // If the notifications table doesn't exist yet, silently continue with empty array
    console.warn("Notifications table missing or error:", err.message);
  }

  // --- Compute operational alerts from live data ---
  const computedAlerts = [];

  // Alert: Flights with < 10% seats remaining
  const lowSeatFlights = await db.query(`
    SELECT f.id, f.flight_number, al.name AS airline, da.city AS departure_city, aa.city AS arrival_city,
           f.available_seats, f.total_seats,
           ROUND((f.available_seats::numeric / NULLIF(f.total_seats, 0)) * 100, 1) as fill_pct
    FROM flights f
    JOIN airlines al ON f.airline_id = al.id
    JOIN airports da ON f.departure_airport_id = da.id
    JOIN airports aa ON f.arrival_airport_id = aa.id
    WHERE f.available_seats > 0 AND f.departure_time > NOW()
      AND (f.available_seats::numeric / NULLIF(f.total_seats, 0)) < 0.1
    ORDER BY fill_pct ASC
    LIMIT 5
  `);
  lowSeatFlights.rows.forEach(f => {
    computedAlerts.push({
      id: `computed_seat_${f.id}`,
      type: 'capacity',
      priority: 'high',
      title: 'Near-Full Flight',
      message: `${f.airline} ${f.flight_number} (${f.departure_city} â†’ ${f.arrival_city}) is at ${100 - f.fill_pct}% capacity â€” only ${f.available_seats} seats remain.`,
      is_read: false,
      created_at: new Date().toISOString()
    });
  });

  // Alert: Cancellation spike â€” more than 3 cancellations in the last 24h
  const recentCancels = await db.query(`
    SELECT COUNT(id) as count FROM bookings
    WHERE status = 'cancelled' AND booking_date >= NOW() - INTERVAL '24 hours'
  `);
  if (parseInt(recentCancels.rows[0].count) >= 3) {
    computedAlerts.push({
      id: 'computed_cancellation_spike',
      type: 'cancellation',
      priority: 'high',
      title: 'Cancellation Spike Detected',
      message: `${recentCancels.rows[0].count} bookings were cancelled in the last 24 hours. Investigate potential route or pricing issues.`,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  // Alert: Aircraft in maintenance
  const maintenanceAircraft = await db.query(`
    SELECT model, tail_number FROM aircraft WHERE status = 'Maintenance'
  `);
  maintenanceAircraft.rows.forEach(a => {
    computedAlerts.push({
      id: `computed_maintenance_${a.tail_number}`,
      type: 'maintenance',
      priority: 'medium',
      title: 'Aircraft in Maintenance',
      message: `${a.model} (${a.tail_number}) is currently offline for maintenance and unavailable for scheduling.`,
      is_read: false,
      created_at: new Date().toISOString()
    });
  });

  res.status(200).json({
    notifications: stored.rows,
    alerts: computedAlerts
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      res.status(404);
      throw new Error('Notification not found');
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === '42P01') { // undefined_table
      res.status(404);
      throw new Error('Notification not found (table missing)');
    }
    throw err;
  }
});


const bcrypt = require('bcryptjs');

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if email already exists
  const userExists = await User.findByEmail(email);
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // 2. Check Admin limit (Max 3)
  const adminCountResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
  const currentAdmins = parseInt(adminCountResult.rows[0].count);
  
  if (currentAdmins >= 3) {
    res.status(400);
    throw new Error('Maximum limit of 3 Admins reached.');
  }

  // 3. Create the Admin
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await User.create(name, email, hashedPassword, 'admin');

  res.status(201).json({
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.getById(id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'superadmin') {
    res.status(403);
    throw new Error('Superadmin accounts cannot be deleted for security reasons.');
  }
  await User.delete(id);
  res.status(200).json({ message: 'User deleted successfully' });
});

const createPassenger = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findByEmail(email);
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create(name, email, hashedPassword, 'user');

  res.status(201).json(newUser);
});

// --- Airport Management ---

const getAllAirports = asyncHandler(async (req, res) => {
  const result = await db.query("SELECT * FROM airports ORDER BY city ASC");
  res.status(200).json(result.rows);
});

const createAirport = asyncHandler(async (req, res) => {
  const { name, city, country, iata_code, icao_code } = req.body;
  const result = await db.query(
    "INSERT INTO airports (name, city, country, iata_code, icao_code) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, city, country, iata_code, icao_code]
  );
  res.status(201).json(result.rows[0]);
});

const deleteAirport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM airports WHERE id = $1", [id]);
  res.status(200).json({ message: 'Airport deleted' });
});

module.exports = {
  getDashboardStats,
  getAllBookings,
  getBookingDetails,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
  createAdmin,
  deleteUser,
  createPassenger,
  getAllAirports,
  createAirport,
  deleteAirport,
  getFleet,
  getAvailableFleet,
  createAircraft,
  updateAircraft,
  deleteAircraft,
  toggleAircraftStatus,
  getSeatMatrix,
  getAnalytics,
  getPayments,
  getNotifications,
  markNotificationRead
};



