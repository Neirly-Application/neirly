const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/complete-profile', async (req, res) => {
  const { name, age, bio, lng, lat } = req.body;
  const u = await User.findByIdAndUpdate(req.user._id, {
    name, age, bio,
    location: { type: 'Point', coordinates: [lng, lat] }
  }, { new: true });
  res.json(u);
});

module.exports = router;
