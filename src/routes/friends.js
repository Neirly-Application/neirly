const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../auth/authMiddleware');
const User = require('../models/User');
const mongoose = require('mongoose');

router.use(authMiddleware);

router.post('/friends/request', async (req, res) => {
  const { uniquenick } = req.body;

  if (!uniquenick) {
    return res.status(400).json({ message: 'Nickname is required.' });
  }

  try {
    // Senza lean() per poter usare metodi Mongoose se serve
    const [targetUser, requestingUser] = await Promise.all([
      User.findOne({ uniquenick }).select('_id friends friendRequestsReceived friendRequestsSent name uniquenick'),
      User.findById(req.user._id).select('_id friends friendRequestsReceived friendRequestsSent name uniquenick')
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

    const userIdStr = req.user._id.toString();
    const targetIdStr = targetUser._id.toString();

    // Controllo amici già esistenti
    const alreadyFriends =
      targetUser.friends.some(fid => fid.toString() === userIdStr) ||
      requestingUser.friends.some(fid => fid.toString() === targetIdStr);

    if (alreadyFriends) {
      return res.status(400).json({ message: `You and ${targetUser.name || targetUser.uniquenick} are already friends.` });
    }

    // Richiesta già inviata?
    const requestSent = requestingUser.friendRequestsSent.some(fid => fid.toString() === targetIdStr);
    if (requestSent) {
      return res.status(400).json({ message: `You already sent a friend request to ${targetUser.name || targetUser.uniquenick}.` });
    }

    // Lui ha già richiesto te?
    const requestReceived = requestingUser.friendRequestsReceived.some(fid => fid.toString() === targetIdStr);
    if (requestReceived) {
      return res.status(400).json({ message: `${targetUser.name || targetUser.uniquenick} already sent you a friend request. You can accept it.` });
    }

    // Aggiungi richiesta
    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $addToSet: { friendRequestsSent: targetUser._id } }),
      User.updateOne({ _id: targetUser._id }, { $addToSet: { friendRequestsReceived: req.user._id } }),
    ]);

    res.json({ message: 'Friend request sent.' });

  } catch (err) {
    console.error('Friend request error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/friends/respond', async (req, res) => {
  const { fromUserId, action } = req.body;
  if (!fromUserId || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid parameters' });
  }

  try {
    const user = await User.findById(req.user._id).select('friendRequestsReceived').lean();

    // Controllo con confronto stringhe
    const hasRequest = user.friendRequestsReceived.some(id => id.toString() === fromUserId);
    if (!hasRequest) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    if (action === 'accept') {
      await Promise.all([
        User.updateOne({ _id: req.user._id }, {
          $addToSet: { friends: fromUserId },
          $pull: { friendRequestsReceived: fromUserId }
        }),
        User.updateOne({ _id: fromUserId }, {
          $addToSet: { friends: req.user._id },
          $pull: { friendRequestsSent: req.user._id }
        }),
      ]);
      return res.json({ message: 'Friend request accepted.' });
    } else {
      // reject
      await Promise.all([
        User.updateOne({ _id: req.user._id }, { $pull: { friendRequestsReceived: fromUserId } }),
        User.updateOne({ _id: fromUserId }, { $pull: { friendRequestsSent: req.user._id } }),
      ]);
      return res.json({ message: 'Friend request rejected.' });
    }
  } catch (err) {
    console.error('Friend request response error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/friends/cancel/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(req.user._id).select('friendRequestsSent').lean();

    const hasRequestSent = user.friendRequestsSent.some(id => id.toString() === userId);
    if (!hasRequestSent) {
      return res.status(404).json({ message: 'Friend request not found.' });
    }

    await Promise.all([
      User.updateOne({ _id: req.user._id }, { $pull: { friendRequestsSent: userId } }),
      User.updateOne({ _id: userId }, { $pull: { friendRequestsReceived: req.user._id } }),
    ]);

    res.json({ message: 'Friend request cancelled.' });

  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.get('/friends', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email profilePictureUrl uniquenick')
      .populate('friendRequestsReceived', 'name email profilePictureUrl uniquenick')
      .populate('friendRequestsSent', 'name email profilePictureUrl uniquenick')
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      confirmedFriends: user.friends || [],
      pendingRequests: user.friendRequestsReceived || [],
      sentRequests: user.friendRequestsSent || []
    });
  } catch (err) {
    console.error('Error loading friends:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

router.delete('/friends/remove/:friendId', async (req, res) => {
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