const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Notification = require('../models/Notification'); 

function checkCEO(req, res, next) {
  if (!req.user || !req.user.roles.includes('ceo')) {
    return res.status(403).json({ message: 'Accesso negato' });
  }
  next();
}

router.delete('/:id', checkCEO, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Non puoi eliminare te stesso' });
    }

    await Notification.deleteMany({ userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ message: 'Utente e notifiche eliminati con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore del server' });
  }
});

module.exports = router;