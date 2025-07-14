const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.get('/near-me', authMiddleware, async (req, res) => {
  const { distance = 10000 } = req.query; // metri
  const [lng, lat] = req.user.location.coordinates;
  const nearby = await User.find({
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: parseInt(distance)
      }
    }
  }).select('-passwordHash');
  res.json(nearby);
});

module.exports = router;
