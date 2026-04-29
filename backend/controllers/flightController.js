const Flight = require('../models/flightModel');
const asyncHandler = require('../utils/asyncHandler');

const getAllFlights = asyncHandler(async (req, res) => {
  const { departure_city, arrival_city, departure_date } = req.query;
  
  let flights;
  if (departure_city || arrival_city || departure_date) {
    flights = await Flight.search({ departure_city, arrival_city, departure_date });
  } else {
    flights = await Flight.getAll();
  }
  
  res.status(200).json(flights);
});

const createFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.create(req.body);
  res.status(201).json(flight);
});

const updateFlight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.update(id, req.body);
  if (!flight) {
    res.status(404);
    throw new Error('Flight not found');
  }
  res.status(200).json(flight);
});

const deleteFlight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.delete(id);
  if (!flight) {
    res.status(404);
    throw new Error('Flight not found');
  }
  res.status(200).json({ message: 'Flight deleted successfully' });
});

const getFlightById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.getById(id);
  if (!flight) {
    res.status(404);
    throw new Error('Flight not found');
  }
  res.status(200).json(flight);
});

module.exports = {
  getAllFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightById
};
