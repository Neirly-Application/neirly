const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/authMiddleware');
const User = require('../models/User');

router.get('/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;