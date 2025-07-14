const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User');

const upload = multer({
  dest: path.join(__dirname, '../../user_pfps/'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('The file must be an image.'));
    }
    cb(null, true);
  }
});

router.use(authMiddleware);

router.get('/profile/check-nick', async (req, res) => {
  try {
    const { nick } = req.query;
    if (!nick || typeof nick !== 'string') {
      return res.status(400).json({ message: 'Nickname is required.' });
    }

    const existingUser = await User.findOne({ uniquenick: nick.toLowerCase() });

    if (existingUser) {
      return res.json({ available: false, message: 'Nickname already in use.' });
    } else {
      return res.json({ available: true });
    }
  } catch (error) {
    console.error('Error checking nickname:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      birthdate: user.birthdate,
      nickname: user.nickname,
      uniquenick: user.uniquenick,
      roles: user.roles,
      profilePictureUrl: user.profilePictureUrl || null,
      about_me: user.about_me || '',
      bioLimit: user.bioLimit,
      uniquenickChangedAt: user.uniquenickChangedAt || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = req.user;
    const updates = {};
    const updatedFields = [];

    if (
      typeof req.body.nickname === 'string' &&
      req.body.nickname.trim() !== '' &&
      req.body.nickname !== user.nickname
    ) {
      updates.nickname = req.body.nickname.trim();
      updatedFields.push('nickname');
    }

    if (
      typeof req.body.uniquenick === 'string' &&
      req.body.uniquenick.trim() !== '' &&
      req.body.uniquenick !== user.uniquenick
    ) {
      const now = new Date();
      const lastChanged = user.uniquenickChangedAt || new Date(0);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (now - lastChanged < sevenDays) {
        return res.status(403).json({ message: 'Uniquenick can only be changed every 7 days.' });
      }

      const newUniquenick = req.body.uniquenick.trim().toLowerCase();
      const isValidUniquenick = /^[a-z0-9._]+$/.test(newUniquenick);

      if (!isValidUniquenick) {
        return res.status(400).json({
          message:
            'Nickname can only contain lowercase letters, numbers, underscores, and dots.',
        });
      }

      const existingUser = await User.findOne({
        uniquenick: newUniquenick,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({ message: 'This nickname is already in use.' });
      }

      updates.uniquenick = newUniquenick;
      updates.uniquenickChangedAt = now;
      updatedFields.push('uniquenick');
    }

    if (
      typeof req.body.about_me === 'string' &&
      req.body.about_me.trim() !== '' &&
      req.body.about_me !== user.about_me
    ) {
      updates.about_me = req.body.about_me.trim().slice(0, 190);
      updatedFields.push('about_me');
    }

    if (req.file) {
      if (user.profilePictureUrl) {
        const oldPath = path.join(__dirname, '../../', user.profilePictureUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.warn('Error removing old profile picture:', err.message);
          });
        }
      }

      updates.profilePictureUrl = `/user_pfps/${req.file.filename}`;
      updatedFields.push('profilePicture');
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: 'No fields updated.' });
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'Profile successfully updated!',
      updatedFields,
      profilePictureUrl: user.profilePictureUrl,
      nickname: user.nickname,
      uniquenick: user.uniquenick,
      about_me: user.about_me,
      uniquenickChangedAt: user.uniquenickChangedAt,
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal error while updating the profile.' });
  }
});

module.exports = router;
