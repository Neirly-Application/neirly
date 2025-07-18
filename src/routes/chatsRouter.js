const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const Message = require('../models/Message');

router.get('/chats/friends-and-chats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('friends', 'name profilePictureUrl uniquenick')
      .populate('recentChats', 'name profilePictureUrl uniquenick')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      friends: user.friends,
      recentChats: user.recentChats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/chats/messages/:userId', authMiddleware, async (req, res) => {
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
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/chats/messages', authMiddleware, async (req, res) => {
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

    await User.updateOne({ _id: senderId }, { $addToSet: { recentChats: to } });
    await User.updateOne({ _id: to }, { $addToSet: { recentChats: senderId } });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users/:id/profile-picture', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).send('User not found');

    const defaultPath = path.join(__dirname, '../../public/media/user.png');
    const baseDir = path.join(__dirname, '../user_pfps');

    if (!user.profilePictureUrl) {
      return res.sendFile(defaultPath);
    }

    const safeFilename = path.basename(user.profilePictureUrl);
    const imgPath = path.join(baseDir, safeFilename);

    if (!fs.existsSync(imgPath)) {
      return res.sendFile(defaultPath);
    }

    res.sendFile(imgPath);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;