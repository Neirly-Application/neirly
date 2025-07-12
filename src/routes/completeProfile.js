const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/complete-profile', async (req, res) => {
  const { userId, username, birthdate, password, wantsUpdates, acceptedTerms, profilePictureUrl } = req.body;

  if (!userId || !username || !birthdate || !password || acceptedTerms !== true) {
    return res.status(400).json({ message: 'All required fields must be filled and terms must be accepted.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.name = username;
    user.birthdate = new Date(birthdate);
    user.passwordHash = hashedPassword;
    user.wantsUpdates = wantsUpdates === true;
    user.acceptedTerms = true;
    user.profileCompleted = true;

    if (profilePictureUrl) {
      user.profilePictureUrl = profilePictureUrl;
    }

    await user.save();

    res.json({ message: 'Profile completed successfully!' });
  } catch (error) {
    console.error('Error completing profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
