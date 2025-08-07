const express = require('express');
const router  = express.Router();
const User    = require('../../models/User');
const ApiKey  = require('../../models/ApiKey');

router.get('/user-info', async (req, res) => {
  const apiKey = req.headers.authorization;
  const nick   = (req.query.nick || '').toLowerCase();

  if (!apiKey?.length || !nick)
    return res.status(400).json({ message: 'Missing API key or ?nick' });

  const valid = await ApiKey.findOne({ key: apiKey, status: 'active' });
  if (!valid)   return res.status(403).json({ message: 'Invalid or revoked API key' });

  const user = await User.findOne({ uniquenick: nick });
  if (!user)    return res.status(404).json({ message: 'User not found' });

  res.json({
    username: user.name,
    profilePictureUrl: user.profilePictureUrl,
    uniquenick: user.uniquenick,
    about: user.about_me,
    id: user._id
  });
});

module.exports = router;
