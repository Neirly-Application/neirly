const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.post('/ban-user', authMiddleware, requireRole('ceo'), async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'User ID mancante' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utente non trovato' });

    user.banned = true;
    await user.save();

    res.json({ message: 'Utente bannato con successo' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Errore server' });
  }
});

module.exports = router;
