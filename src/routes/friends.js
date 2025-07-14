const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Richiesta amicizia
router.post('/request', authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email richiesta' });
  if (email === req.user.email) return res.status(400).json({ message: "You can't add yourself!" });

  try {
    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    // Verifica se già amici o già richiesta inviata
    const isAlreadyFriend = targetUser.friends?.includes(req.user._id);
    const alreadyRequested = await Notification.findOne({
      userId: targetUser._id,
      type: 'friend_request',
      'meta.from': req.user._id,
      read: false
    });

    if (isAlreadyFriend) return res.status(400).json({ message: "You're already friends." });
    if (alreadyRequested) return res.status(400).json({ message: "A pending request has already been sent." });

    // Crea notifica
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

// Accetta/rifiuta richiesta
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
    // Amici confermati
    const user = await User.findById(req.user._id).populate('friends', 'name email');

    // Richieste pendenti: notifiche non lette di tipo friend_request
    const pendingNotifs = await Notification.find({
      userId: req.user._id,
      type: 'friend_request',
      read: false
    }).populate('meta.from', 'name email');

    // Mappa le notifiche per avere solo i dati essenziali della richiesta
    const pendingRequests = pendingNotifs.map(n => ({
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

module.exports = router;
