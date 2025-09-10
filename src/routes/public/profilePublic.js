/* const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const apiKeyMiddleware = require('../../auth/apiKeyMiddleware');

router.get('/profile', apiKeyMiddleware, async (req, res) => {
  try {
    const nick = req.query.nick;
    if (!nick) return res.status(400).json({ message: 'Missing ?nick query parameter.' });

    const user = await User.findOne({ uniquenick: nick.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json({
      nickname: user.name,
      uniquenick: user.uniquenick,
      profilePictureUrl: user.profilePictureUrl || null,
      about_me: user.about_me || '',
      join_date: user.join_date,
      hasPremium: !!user.hasPremium,
    });
  } catch (err) {
    console.error('Public profile error:', err.message);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
*/