const Flight = require('../models/flightModel');

const getAllFlights = async (req, res) => {
  try {
    const { departure_city, arrival_city, departure_date } = req.query;
    
    let flights;
    if (departure_city || arrival_city || departure_date) {
      flights = await Flight.search({ departure_city, arrival_city, departure_date });
    } else {
      flights = await Flight.getAll();
    }
    
    res.status(200).json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createFlight = async (req, res) => {
  try {
    const flight = await Flight.create(req.body);
    res.status(201).json(flight);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFlightById = async (req, res) => {
  try {
    const { id } = req.params;
    const flight = await Flight.getById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.status(200).json(flight);
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllFlights,
  createFlight,
  getFlightById
};
