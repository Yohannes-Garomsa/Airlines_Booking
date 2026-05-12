const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// --- Dashboard Stats ---

const getDashboardStats = asyncHandler(async (req, res) => {
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
});

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
  const result = await db.query('SELECT * FROM aircraft ORDER BY model ASC');
  res.status(200).json(result.rows);
});

// --- Seat Management ---

const getSeatMatrix = asyncHandler(async (req, res) => {
  const { flightId } = req.params;
  const result = await db.query(`
    SELECT s.*, b.pnr, p.name as passenger_name
    FROM seats s
    LEFT JOIN bookings b ON s.booking_id = b.id
    LEFT JOIN passengers p ON b.id = p.booking_id
    WHERE s.flight_id = $1
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
  const popularRoutes = await db.query(`
    SELECT f.departure_city, f.arrival_city, COUNT(b.id) as booking_count
    FROM bookings b
    JOIN flights f ON b.flight_id = f.id
    GROUP BY f.departure_city, f.arrival_city
    ORDER BY booking_count DESC
    LIMIT 5
  `);
  
  const revenueTrend = await db.query(`
    SELECT DATE_TRUNC('day', booking_date) as day, SUM(total_price) as daily_revenue
    FROM bookings
    WHERE status = 'confirmed'
    GROUP BY day
    ORDER BY day ASC
    LIMIT 30
  `);

  res.status(200).json({ popularRoutes: popularRoutes.rows, revenueTrend: revenueTrend.rows });
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
  const result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC');
  res.status(200).json(result.rows);
});

const bcrypt = require('bcryptjs');

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if email already exists
  const userExists = await User.getByEmail(email);
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
  const newAdmin = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin'
  });

  res.status(201).json({
    id: newAdmin.id,
    name: newAdmin.name,
    email: newAdmin.email,
    role: newAdmin.role
  });
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
  getAllAirports,
  createAirport,
  deleteAirport,
  getFleet,
  toggleAircraftStatus,
  getSeatMatrix,
  getAnalytics,
  getPayments,
  getNotifications
};
