const validateFlight = (req, res, next) => {
  const { airline, flight_number, departure_airport_id, arrival_airport_id, departure_time, arrival_time, economy_price } = req.body;
  
  if (!airline || !flight_number || !departure_airport_id || !arrival_airport_id || !departure_time || !arrival_time || !economy_price) {
    res.status(400);
    throw new Error('Please provide all flight details including airports and schedule.');
  }

  if (departure_airport_id === arrival_airport_id) {
    res.status(400);
    throw new Error('Departure and arrival airports cannot be the same.');
  }

  if (new Date(departure_time) >= new Date(arrival_time)) {
    res.status(400);
    throw new Error('Arrival time must be after departure time.');
  }

  next();
};

module.exports = { validateFlight };
