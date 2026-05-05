const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const { protectRoute, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protectRoute, adminOnly, getUsers);

module.exports = router;
