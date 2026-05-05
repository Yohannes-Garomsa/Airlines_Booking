const Flight = require('../models/flightModel');
const asyncHandler = require('../utils/asyncHandler');
const cache = require('../utils/cache');

const getAllFlights = asyncHandler(async (req, res) => {
  const { departure_city, arrival_city, departure_date, min_price, max_price, max_duration, sort_by, limit, page } = req.query;
  const cacheKey = JSON.stringify(req.query);
  
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  let flights;
  if (departure_city || arrival_city || departure_date || min_price || max_price || max_duration || sort_by) {
    flights = await Flight.search({ departure_city, arrival_city, departure_date, min_price, max_price, max_duration, sort_by, limit, page });
  } else {
    flights = await Flight.getAll();
  }

  cache.set(cacheKey, flights);
  res.status(200).json(flights);
});

const createFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.create(req.body);
  cache.clear(); // Clear cache when data changes
  res.status(201).json(flight);
});

const updateFlight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.update(id, req.body);
  if (!flight) {
    res.status(404);
    throw new Error('Flight not found');
  }
  cache.clear(); // Clear cache when data changes
  res.status(200).json(flight);
});

const deleteFlight = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const flight = await Flight.delete(id);
  if (!flight) {
    res.status(404);
    throw new Error('Flight not found');
  }
  cache.clear(); // Clear cache when data changes
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

const getCities = asyncHandler(async (req, res) => {
  const cities = await Flight.getCities();
  res.status(200).json(cities);
});

const getOrigins = asyncHandler(async (req, res) => {
  const cities = await Flight.getOrigins();
  res.status(200).json(cities);
});

const getDestinations = asyncHandler(async (req, res) => {
  const { origin } = req.query;
  const cities = await Flight.getDestinations(origin);
  res.status(200).json(cities);
});

module.exports = {
  getAllFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightById,
  getCities,
  getOrigins,
  getDestinations
};
