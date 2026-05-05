const Booking = require('../models/bookingModel');
const Flight = require('../models/flightModel');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../utils/notificationService');

const createBooking = asyncHandler(async (req, res) => {
  const { flightId, totalPrice, cabinClass, passengers } = req.body;
  const user = req.user;

  if (!flightId || !totalPrice || !passengers || passengers.length === 0) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const booking = await Booking.create(user.id, flightId, totalPrice, cabinClass, passengers);
  
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
  const bookings = await Booking.getAll();
  res.status(200).json(bookings);
});

const getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const bookings = await Booking.getByUserId(userId);
  res.status(200).json(bookings);
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
  cancelBooking
};
