const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/users', requireRole('ceo'), async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash');
    res.json(users);
  } catch (error) {
    console.error('Error in the /users route:', error);

    res.status(500).json({ message: 'Error fetching users.' });
  }
});

module.exports = router;
