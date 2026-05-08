const Booking = require('../models/bookingModel');
const Flight = require('../models/flightModel');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../utils/notificationService');
const db = require('../config/db');

const createBooking = asyncHandler(async (req, res) => {
  const { flightId, totalPrice, cabinClass, passengers, passengerCounts } = req.body;
  const user = req.user;

  await Booking.expireOldPending();

  if (!flightId || !totalPrice || !passengers || passengers.length === 0 || !passengerCounts || passengerCounts.adults < 1) {
    res.status(400);
    throw new Error('Please provide all required fields and passenger counts');
  }

  const booking = await Booking.create(user.id, flightId, totalPrice, cabinClass, passengers, passengerCounts);
  
  // Send Notification
  try {
    const flight = await Flight.getById(flightId);
    if (flight) {
      await notificationService.sendBookingConfirmation(user, booking, flight);
    }
  } catch (notifyError) {
    console.error('Notification failed:', notifyError);
    // Don't fail the booking if notification fails
  }

  res.status(201).json(booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  await Booking.expireOldPending();

  let bookings;
  if (status && status !== 'all') {
    bookings = await Booking.getByStatus(status);
  } else {
    bookings = await Booking.getAll();
  }
  
  res.status(200).json(bookings);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await Booking.expireOldPending();
  const bookings = await Booking.getByUserId(userId);
  res.status(200).json(bookings);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await db.query(
    'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error('Booking not found');
  }

  res.status(200).json(result.rows[0]);
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  const booking = await Booking.cancel(bookingId, userId);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found or not authorized');
  }

  res.status(200).json({ message: 'Booking cancelled successfully', booking });
});

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  cancelBooking,
  updateBookingStatus
};
