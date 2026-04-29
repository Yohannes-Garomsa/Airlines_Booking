const Seat = require('../models/seatModel');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all seats for a flight
// @route   GET /api/seats/flight/:flightId
// @access  Public
const getFlightSeats = asyncHandler(async (req, res) => {
  const { flightId } = req.params;
  const seats = await Seat.getByFlightId(flightId);
  
  // If no seats initialized, initialize them (auto-scaffolding for demo)
  if (seats.length === 0) {
    await Seat.initialize(flightId);
    const newSeats = await Seat.getByFlightId(flightId);
    return res.status(200).json(newSeats);
  }
  
  res.status(200).json(seats);
});

// @desc    Reserve a seat
// @route   PATCH /api/seats/reserve
// @access  Private
const reserveSeat = asyncHandler(async (req, res) => {
  const { flightId, seatNumber, bookingId } = req.body;
  
  const seat = await Seat.reserve(flightId, seatNumber, bookingId);
  if (!seat) {
    res.status(400);
    throw new Error('Seat is already occupied or does not exist');
  }
  
  res.status(200).json({ message: 'Seat reserved successfully', seat });
});

module.exports = { getFlightSeats, reserveSeat };
