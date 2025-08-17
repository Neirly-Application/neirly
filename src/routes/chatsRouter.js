const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../auth/authMiddleware');
const User = require('../models/User');
const Message = require('../models/Message');

router.use(authMiddleware);

// GET friends and recent chats
router.get('/chats/friends-and-chats', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('friends', 'name profilePictureUrl uniquenick')
      .populate('recentChats', 'name profilePictureUrl uniquenick')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      friends: user.friends || [],
      recentChats: user.recentChats || [],
    });
  } catch (err) {
    console.error('[ERROR] /chats/friends-and-chats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET messages with a specific user
router.get('/chats/messages/:userId', async (req, res) => {
  const userId = req.user._id;
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: otherUserId, deletedBySender: { $ne: true } },
        { sender: otherUserId, recipient: userId, deletedByRecipient: { $ne: true } }
      ]
    }).sort('timestamp').lean();

    res.json(messages);
  } catch (err) {
    console.error('[ERROR] /chats/messages/:userId:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST send a message
router.post('/chats/messages', async (req, res) => {
  const senderId = req.user._id;
  const { to, content, type = 'text' } = req.body;

  const allowedTypes = ['text', 'image', 'video', 'audio', 'file', 'system'];
  if (!to || !allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid recipient or message type' });
  }

  if (type === 'text' && (!content || content.trim() === '')) {
    return res.status(400).json({ message: 'Text content required' });
  }

  try {
    const newMessage = await Message.create({
      sender: senderId,
      recipient: to,
      content,
      type,
      timestamp: new Date()
    });

    // Aggiorna recentChats per entrambi gli utenti
    await User.updateOne({ _id: senderId }, { $addToSet: { recentChats: to } });
    await User.updateOne({ _id: to }, { $addToSet: { recentChats: senderId } });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('[ERROR] POST /chats/messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET user profile picture
router.get('/users/:id/profile-picture', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).send('User not found');

    const defaultPath = path.join(__dirname, '../../public/media/user.png');
    const baseDir = path.join(__dirname, '../user_pfps');

    if (!user.profilePictureUrl) {
      return res.status(200).sendFile(defaultPath);
    }

    const safeFilename = path.basename(user.profilePictureUrl);
    const imgPath = path.join(baseDir, safeFilename);

    if (!fs.existsSync(imgPath)) {
      return res.status(200).sendFile(defaultPath);
    }

    res.status(200).sendFile(imgPath);
  } catch (err) {
    console.error('[ERROR] GET /users/:id/profile-picture:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;