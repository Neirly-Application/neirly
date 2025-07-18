const express = require('express');
const router = express.Router();
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
        { userId: userId, to: otherUserId },
        { userId: otherUserId, to: userId }
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

  if (!to || !content) {
    return res.status(400).json({ message: 'Missing recipient or content' });
  }

  try {
    const newMessage = await Message.create({
      userId: senderId,
      to,
      content,
      type,
      timestamp: new Date()
    });

    await User.updateMany(
      { _id: { $in: [senderId, to] } },
      { $addToSet: { recentChats: [senderId, to].find(id => id.toString() !== senderId.toString()) } }
    );

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;