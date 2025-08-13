const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

router.use(authMiddleware);

router.post('/user/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    const userId = req.user._id;

    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).send({ success: false, message: 'Invalid theme.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    );

    res.send({ success: true, theme: updatedUser.theme });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Error while saving theme preference.' });
  }
});

module.exports = router;
