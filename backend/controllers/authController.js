const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create(name, email, hashedPassword);
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({ user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt for: ${email}`);

  const user = await User.findByEmail(email);
  if (!user) {
    console.log('Login failed: User not found');
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`Password match: ${isMatch}`);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.status(200).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
});

const getMe = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    res.status(401);
    throw new Error('User context missing or invalid token format');
  }

  const user = await User.getById(req.user.id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found. Your account might have been deleted.');
  }
  
  res.status(200).json(user);
});

module.exports = { register, login, getMe };
