const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// GET /api/public/profile?nick={uniquenick}
router.get('/profile', async (req, res) => {
  try {
    const nick = req.query.nick;
    if (!nick) {
      return res.status(400).json({ message: 'Missing ?nick query parameter.' });
    }

    const user = await require('../../models/User').findOne({ uniquenick: nick.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      nickname: user.name,
      uniquenick: user.uniquenick,
      profilePictureUrl: user.profilePictureUrl || null,
      about_me: user.about_me || '',
      join_date: user.join_date,
      hasPremium: !!user.hasPremium,
      coins: typeof user.coins === 'number' ? user.coins : 0
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});
module.exports = router;
