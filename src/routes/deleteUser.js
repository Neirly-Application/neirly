const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const Notification = require('../models/Notification'); 
const Activity = require('../models/ActivityLogs');

function checkCEO(req, res, next) {
  if (!req.user || !req.user.roles.includes('ceo')) {
    return res.status(403).json({ message: 'Access denied.' });
  }
  next();
}

router.delete('/profile/:id', authMiddleware, checkCEO, async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: "You can't delete yourself." });
    }

    await Notification.deleteMany({ userId });
    await Activity.deleteMany({ userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'All user data have been successfully deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;