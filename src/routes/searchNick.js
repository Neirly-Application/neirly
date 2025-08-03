const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.get('/search/users', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ message: 'Query too short.' });
    }

    const query = q.trim().toLowerCase().replace(/^@/, '');

    const users = await User.find({
      $or: [
        { uniquenick: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(100)
      .select('name uniquenick profilePictureUrl');

    return res.json({ users });
  } catch (err) {
    console.error('[ERROR] /search/users:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.status(400).json({ message: 'Query too short.' });
    }

    const query = q.trim().toLowerCase();

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { uniquenick: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(100)
      .select('name uniquenick profilePictureUrl');

    return res.json({ users });
  } catch (err) {
    console.error('[ERROR] /search:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;