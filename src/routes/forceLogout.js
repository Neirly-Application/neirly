const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../auth/authMiddleware');
const User = require('../models/User');

router.use(authMiddleware);

router.post('/force-logout', requireRole('ceo'), async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'Missing user ID.' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.forceLogout = true;
    await user.save();

    res.json({ message: 'User logged out successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
