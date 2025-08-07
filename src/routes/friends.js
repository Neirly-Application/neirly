const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

router.post('/friends/request', authMiddleware, async (req, res) => {
  const { uniquenick } = req.body;

  if (!uniquenick) {
    return res.status(400).json({ message: 'Nickname is required.' });
  }

  try {
    const [targetUser, requestingUser] = await Promise.all([
      User.findOne({ uniquenick }).select('_id friends').lean(),
      User.findById(req.user._id).select('friends name email uniquenick').lean()
    ]);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!requestingUser) {
      return res.status(404).json({ message: 'Authenticated user not found.' });
    }

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't add yourself." });
    }

    const alreadyFriends =
      targetUser.friends?.includes(req.user._id) ||
      requestingUser.friends?.includes(targetUser._id);
    if (alreadyFriends) {
      return res.status(400).json({ message: "You're already friends." });
    }

    const alreadyRequested = await Notification.exists({
      userId: targetUser._id,
      type: 'friend_request',
      'meta.from': req.user._id,
      read: false
    });
    if (alreadyRequested) {
      return res.status(400).json({ message: "You already sent a friend request." });
    }

    const heAlreadyRequestedMe = await Notification.exists({
      userId: req.user._id,
      type: 'friend_request',
      'meta.from': targetUser._id,
      read: false
    });
    if (heAlreadyRequestedMe) {
      return res.status(400).json({
        message: "This user already sent you a friend request. You can accept it instead."
      });
    }

    const notification = new Notification({
      userId: targetUser._id,
      title: 'Friend Request',
      message: `${requestingUser.name || requestingUser.uniquenick} sent you a friend request!`,
      type: 'friend_request',
      read: false,
      meta: {
        from: req.user._id,
        fromName: requestingUser.name || requestingUser.uniquenick
      },
      date: new Date()
    });

    await notification.save();
    res.json({ message: 'Friend request sent.' });

  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/friends/respond', authMiddleware, async (req, res) => {
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

    const senderUser = await User.findById(senderId).select('_id').lean();
    if (!senderUser) return res.status(404).json({ message: 'Sender not found.' });

    if (action === 'accept') {
      await Promise.all([
        User.updateOne({ _id: req.user._id }, { $addToSet: { friends: senderId } }),
        User.updateOne({ _id: senderId }, { $addToSet: { friends: req.user._id } })
      ]);
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
    console.error('Friend request response error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/friends/cancel/:notificationId', authMiddleware, async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notif = await Notification.findOne({
      _id: notificationId,
      'meta.from': req.user._id,
      type: 'friend_request',
      read: false
    });

    if (!notif) return res.status(404).json({ message: 'Request not found.' });

    await notif.deleteOne();
    res.json({ message: 'Request successfully cancelled.' });

  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const [user, receivedNotifs, sentNotifs] = await Promise.all([
      User.findById(req.user._id)
        .populate('friends', 'name email profilePictureUrl uniquenick')
        .lean(),
      Notification.find({
        userId: req.user._id,
        type: 'friend_request',
        read: false
      })
        .populate('meta.from', 'name email profilePictureUrl uniquenick')
        .lean(),
      Notification.find({
        'meta.from': req.user._id,
        type: 'friend_request',
        read: false
      })
        .populate('userId', 'name email profilePictureUrl uniquenick')
        .lean()
    ]);

    if (!user) return res.status(404).json({ message: 'User not found.' });

    const pendingRequests = receivedNotifs.map(n => ({
      profilePictureUrl: n.meta.from?.profilePictureUrl,
      _id: n._id,
      name: n.meta.from?.name || '-',
      email: n.meta.from?.email || '-',
      uniquenick: n.meta.from?.uniquenick || ''
    }));

    const sentRequests = sentNotifs.map(n => ({
      profilePictureUrl: n.userId?.profilePictureUrl,
      _id: n._id,
      name: n.userId?.name || '-',
      email: n.userId?.email || '-',
      uniquenick: n.userId?.uniquenick || ''
    }));

    res.json({
      confirmedFriends: user.friends || [],
      pendingRequests,
      sentRequests
    });
  } catch (err) {
    console.error('Error while loading friends:', err);
    res.status(500).json({ message: 'Error loading friends.' });
  }
});

router.delete('/friends/remove/:friendId', authMiddleware, async (req, res) => {
  const { friendId } = req.params;
  if (!friendId || !mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({ message: 'Invalid friend ID.' });
  }

  try {
    const friendExists = await User.exists({ _id: friendId });
    if (!friendExists) return res.status(404).json({ message: 'Friend user not found.' });

    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $pull: { friends: friendId } }),
      User.updateOne({ _id: friendId }, { $pull: { friends: req.user._id } })
    ]);

    res.json({ message: 'Friend removed successfully.' });
  } catch (err) {
    console.error('Error removing friend:', err);
    res.status(500).json({ message: 'Error while removing friend.' });
  }
});

module.exports = router;