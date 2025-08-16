const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLogs');

router.use(authMiddleware);

router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const passwordErrors = [];
    if (newPassword.length < 8) {
      passwordErrors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(newPassword)) {
      passwordErrors.push("one uppercase letter");
    }
    if (!/[0-9]/.test(newPassword)) {
      passwordErrors.push("one number");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>_\-\[\]\\\/~`+=;]/.test(newPassword)) {
      passwordErrors.push("one special character");
    }

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: `Password must include ${passwordErrors.join(", ")}.`
      });
    }

    const needsCurrentPassword = !!user.oauthPasswordChanged;

    if (needsCurrentPassword) {
    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
    }
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.oauthPasswordChanged = true;
    await user.save();

    if (ActivityLog?.create) {
      await ActivityLog.create({
        userId: user._id,
        type: 'password-change',
        metadata: { ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip }
      });
    }

    return res.json({ message: 'Password successfully updated.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ message: 'Error while changing password.' });
  }
});


module.exports = router;
