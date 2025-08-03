const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification');

router.post('/request', authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email richiesta' });
  if (email === req.user.email) return res.status(400).json({ message: "You can't add yourself!" });

  try {
    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    const isAlreadyFriend = targetUser.friends?.includes(req.user._id);
    const alreadyRequested = await Notification.findOne({
      userId: targetUser._id,
      type: 'friend_request',
      'meta.from': req.user._id,
      read: false
    });

    if (isAlreadyFriend) return res.status(400).json({ message: "You're already friends." });
    if (alreadyRequested) return res.status(400).json({ message: "A pending request has already been sent." });

    const notifica = new Notification({
      userId: targetUser._id,
      title: 'Friend Request.',
      message: `${req.user.name || req.user.email} sent you a friend request!.`,
      type: 'friend_request',
      read: false,
      meta: {
        from: req.user._id,
        fromName: req.user.name || req.user.email
      },
      date: new Date()
    });

    await notifica.save();

    res.json({ message: 'Pending request.' });
  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/respond', authMiddleware, async (req, res) => {
  const { notificationId, action } = req.body;

  if (!notificationId || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user._id,
      type: 'friend_request'
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found.' });

    const senderId = notification.meta.from;

    if (action === 'accept') {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { friends: senderId } });
      await User.updateOne({ _id: senderId }, { $addToSet: { friends: req.user._id } });

      notification.read = true;
      notification.message += ' (accepted)';
      await notification.save();

      res.json({ message: 'Friend request successfully accepted!' });
    } else {
      notification.read = true;
      notification.message += ' (declined)';
      await notification.save();
      res.json({ message: 'Friend request successfully declined.' });
    }
  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', 'name email profilePictureUrl');

    const pendingNotifs = await Notification.find({
      userId: req.user._id,
      type: 'friend_request',
      read: false
    }).populate('meta.from', 'name email profilePictureUrl');

    const pendingRequests = pendingNotifs.map(n => ({
      profilePictureUrl: n.meta.from?.profilePictureUrl,
      _id: n._id,
      name: n.meta.from?.name || '-',
      email: n.meta.from?.email || '-'
    }));

    res.json({
      confirmedFriends: user.friends || [],
      pendingRequests
    });
  } catch (err) {
    console.error('Error while loading friends:', err);
    res.status(500).json({ message: 'Error loading friends.' });
  }
});

router.delete('/remove/:friendId', authMiddleware, async (req, res) => {
  const { friendId } = req.params;

  if (!friendId) {
    return res.status(400).json({ message: 'Friend ID is required.' });
  }

  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { friends: friendId } });
    await User.updateOne({ _id: friendId }, { $pull: { friends: req.user._id } });

    res.json({ message: 'Friend removed successfully.' });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ message: 'Error while removing friend.' });
  }
});

module.exports = router;
