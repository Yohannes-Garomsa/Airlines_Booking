const express = require('express');
const router = express.Router();
const { searchAirports } = require('../controllers/airportController');

router.get('/', searchAirports);

module.exports = router;
