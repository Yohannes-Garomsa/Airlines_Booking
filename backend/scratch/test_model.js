const Flight = require('../models/flightModel');

async function testMethods() {
  try {
    console.log('Testing getOrigins...');
    const origins = await Flight.getOrigins();
    console.log('Origins:', origins);

    console.log('Testing getDestinations...');
    const destinations = await Flight.getDestinations();
    console.log('Destinations:', destinations);

    console.log('Testing getAll...');
    const flights = await Flight.getAll();
    console.log('Flights count:', flights.length);

    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR IN MODEL METHODS:');
    console.error(err);
    process.exit(1);
  }
}

testMethods();
