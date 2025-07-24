// routes/api.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../authMiddleware/authMiddleware');

// --- API key generator ---
function generateApiKey({ env = 'live', type = 'sk', prefix = 'neirly', length = 32 } = {}) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let random = '';
  for (let i = 0; i < length; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${type}_${env}_${random}`;
}

// GET current key
router.get('/developer/current-key', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.apiKey || user.apiKey.status !== 'active' || !user.apiKey.key) {
    return res.status(404).json({ message: 'No active API key.' });
  }
  const { key, description, createdAt, status, lastUsed } = user.apiKey;
  res.json({ key, description, createdAt, status, lastUsed });
});

// POST generate key
router.post('/developer/generate-key', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  const { description } = req.body;

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ message: 'Please describe how the key will be used (min 10 characters).' });
  }

  if (user.apiKey?.status === 'active' && user.apiKey?.key) {
    return res.status(403).json({ message: 'An active API key already exists. Revoke it first.' });
  }

  const key = generateApiKey();
  user.apiKey = {
    key,
    description: description.trim(),
    createdAt: new Date(),
    status: 'active',
    lastUsed: null
  };
  await user.save();

  res.status(200).json({ key });
});

// POST revoke key
router.post('/developer/revoke-key', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.apiKey || user.apiKey.status !== 'active' || !user.apiKey.key) {
    return res.status(400).json({ message: 'No active API key to revoke.' });
  }
  user.apiKey.status = 'revoked';
  await user.save();
  res.status(200).json({ message: 'API key revoked.' });
});

// PUBLIC API for SDK-like usage
router.get('/public/user-info', async (req, res) => {
  const apiKey = req.headers['authorization'];
  if (!apiKey || typeof apiKey !== 'string') return res.status(401).json({ message: 'API key required.' });

  const user = await User.findOne({ 'apiKey.key': apiKey, 'apiKey.status': 'active' });
  if (!user) return res.status(403).json({ message: 'Invalid or revoked API key.' });

  // Example public info response
  res.json({
    username: user.name,
    profilePictureUrl: user.profilePictureUrl,
    uniquenick: user.uniquenick,
    about: user.about_me,
    id: user._id
  });
});


module.exports = router;
