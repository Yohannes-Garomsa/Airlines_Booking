const Payment = require('../models/paymentModel');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Process a fake payment
// @route   POST /api/payments
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { bookingId, amount, paymentMethod } = req.body;

  if (!bookingId || !amount) {
    res.status(400);
    throw new Error('Please provide booking ID and amount');
  }

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const payment = await Payment.process(bookingId, amount, paymentMethod || 'credit_card');

  res.status(201).json({
    success: true,
    message: 'Payment processed successfully',
    payment
  });
});

module.exports = { processPayment };
