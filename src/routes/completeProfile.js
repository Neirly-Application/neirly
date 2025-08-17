const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authMiddleware } = require('../auth/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

router.post('/complete-profile', async (req, res) => {
  const { username, uniquenick, birthdate, password, wantsUpdates, profilePictureUrl } = req.body;

  const userId = req.user._id;

  if (!username || !uniquenick || !birthdate || !password ) {
    return res.status(400).json({ message: 'All required fields must be filled.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newUniquenick = typeof uniquenick === 'string' ? uniquenick.trim().toLowerCase() : String(uniquenick).trim().toLowerCase();

    const isValidUniquenick = /^[a-z0-9._]+$/.test(newUniquenick);
    if (!isValidUniquenick) {
      return res.status(400).json({
        message: 'Nickname can only contain lowercase letters, numbers, underscores, and dots.',
      });
    }

    const existingUser = await User.findOne({
      uniquenick: newUniquenick,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      return res.status(409).json({ message: 'This nickname is already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = username;
    user.uniquenick = newUniquenick;
    user.birthdate = new Date(birthdate);
    user.passwordHash = hashedPassword;
    user.wantsUpdates = wantsUpdates === true;
    user.profileCompleted = true;

    if (profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
    }

    await user.save();

    res.json({ message: 'Profile completed successfully!' });
  } catch (error) {
    console.error('Error completing profile:', error);

    if (error.code === 11000 && error.keyPattern && error.keyPattern.uniquenick) {
      return res.status(409).json({ message: 'This nickname is already in use.' });
    }

    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;