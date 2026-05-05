const Airport = require('../models/airportModel');
const asyncHandler = require('../utils/asyncHandler');

const searchAirports = asyncHandler(async (req, res) => {
  const { search } = req.query;
  if (!search) {
    const airports = await Airport.getAll();
    return res.status(200).json(airports);
  }
  
  const airports = await Airport.search(search);
  res.status(200).json(airports);
});

module.exports = {
  searchAirports
};
