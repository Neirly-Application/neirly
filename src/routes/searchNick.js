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

router.get('/search/last-searches', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('lastSearches', 'name uniquenick profilePictureUrl');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ searches: user.lastSearches.slice(-10).reverse() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/search/remove-search', authMiddleware, async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { lastSearches: userId }
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove search' });
  }
});

router.post('/search/add-search', authMiddleware, async (req, res) => {
  const { targetUniquenick } = req.body;

  if (!targetUniquenick) return res.status(400).json({ error: 'Missing targetUniquenick' });

  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findOne({ uniquenick: targetUniquenick });

    if (!targetUser) return res.status(404).json({ error: 'Target user not found' });

    currentUser.lastSearches = currentUser.lastSearches.filter(
      id => id.toString() !== targetUser._id.toString()
    );

    currentUser.lastSearches.push(targetUser._id);

    if (currentUser.lastSearches.length > 20) {
      currentUser.lastSearches = currentUser.lastSearches.slice(-20);
    }

    await currentUser.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save search' });
  }
});

module.exports = router;