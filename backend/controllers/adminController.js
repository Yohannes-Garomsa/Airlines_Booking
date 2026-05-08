const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// --- Dashboard Stats ---

const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM flights) as total_flights,
      (SELECT COUNT(*) FROM bookings) as total_bookings,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed')) as total_revenue
  `);
  res.status(200).json(result.rows[0]);
});

// --- Booking Management ---

const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
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

module.exports = {
  getDashboardStats,
  getAllBookings,
  getBookingDetails,
  getAllUsers,
  toggleUserStatus,
  changeUserRole,
  createAdmin
};
