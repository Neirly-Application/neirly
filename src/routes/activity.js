const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLogs');
const { authMiddleware } = require('../authMiddleware/authMiddleware');

router.get('/activity', authMiddleware, async (req, res) => {
  try {
    console.log('User in activity:', req.user);
    const logs = await ActivityLog.find({ userId: req.user._id }).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    console.error('Activity fetch error:', err);
    res.status(500).json({ message: 'Failed to load activity logs.' });
  }
});

module.exports = router;
