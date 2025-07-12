const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Richiesta amicizia
router.post('/request', authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email richiesta' });
  if (email === req.user.email) return res.status(400).json({ message: 'Non puoi aggiungere te stesso' });

  try {
    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'Utente non trovato' });

    // Verifica se già amici o già richiesta inviata
    const isAlreadyFriend = targetUser.friends?.includes(req.user._id);
    const alreadyRequested = await Notification.findOne({
      userId: targetUser._id,
      type: 'friend_request',
      'meta.from': req.user._id,
      read: false
    });

    if (isAlreadyFriend) return res.status(400).json({ message: 'Siete già amici' });
    if (alreadyRequested) return res.status(400).json({ message: 'Richiesta già inviata' });

    // Crea notifica
    const notifica = new Notification({
      userId: targetUser._id,
      title: 'Nuova richiesta di amicizia',
      message: `${req.user.name || req.user.email} ti ha inviato una richiesta di amicizia.`,
      type: 'friend_request',
      read: false,
      meta: {
        from: req.user._id,
        fromName: req.user.name || req.user.email
      },
      date: new Date()
    });

    await notifica.save();

    res.json({ message: 'Richiesta inviata!' });
  } catch (err) {
    console.error('Errore richiesta amicizia:', err);
    res.status(500).json({ message: 'Errore server' });
  }
});

// Accetta/rifiuta richiesta
router.post('/respond', authMiddleware, async (req, res) => {
  const { notificationId, action } = req.body;

  if (!notificationId || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Parametri non validi' });
  }

  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user._id,
      type: 'friend_request'
    });

    if (!notification) return res.status(404).json({ message: 'Notifica non trovata' });

    const senderId = notification.meta.from;

    if (action === 'accept') {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { friends: senderId } });
      await User.updateOne({ _id: senderId }, { $addToSet: { friends: req.user._id } });

      notification.read = true;
      notification.message += ' (accettata)';
      await notification.save();

      res.json({ message: 'Amicizia confermata!' });
    } else {
      notification.read = true;
      notification.message += ' (rifiutata)';
      await notification.save();
      res.json({ message: 'Richiesta rifiutata.' });
    }
  } catch (err) {
    console.error('Errore risposta richiesta:', err);
    res.status(500).json({ message: 'Errore server' });
  }
});

router.get('/', authMiddleware, async (req, res) => {
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
    console.error('Errore caricamento amici:', err);
    res.status(500).json({ message: 'Errore caricamento amici' });
  }
});

module.exports = router;
