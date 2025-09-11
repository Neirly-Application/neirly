const express = require('express');
const router = express.Router();
const AlphaTester = require('../models/AlphaTester');

router.post('/verify-alpha', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Code and email are required.' });
  }

  try {
    const tester = await AlphaTester.findOne({ email }).lean();

    if (!tester) {
      return res.status(404).json({ success: false, message: 'Email not registered.' });
    }

    if (tester.code === code) {
      res.cookie('alphaTester', 'true', {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'Strict',
        secure: process.env.NODE_ENV === 'production'
      });

      return res.json({ success: true, message: 'Access confirmed! Welcome Alpha Tester.' });
    } else {
      return res.status(400).json({ success: false, message: 'Wrong verification code.' });
    }

  } catch (err) {
    console.error('Alpha Tester validation error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;