const Booking = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const { flightId, totalPrice, passengers } = req.body;
    const userId = req.user.id;

    if (!flightId || !totalPrice || !passengers || passengers.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const booking = await Booking.create(userId, flightId, totalPrice, passengers);
    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

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
  cancelBooking
};
