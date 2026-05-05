const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');

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
  
  if (!['admin', 'user'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const updatedUser = await User.update(id, { role });
  res.status(200).json(updatedUser);
});

module.exports = {
  getAllBookings,
  getBookingDetails,
  getAllUsers,
  toggleUserStatus,
  changeUserRole
};
