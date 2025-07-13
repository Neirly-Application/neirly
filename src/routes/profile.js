const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../authMiddleware/authMiddleware');
const User = require('../models/User'); // Assicurati di avere questa importazione

// Multer config
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

// Auth middleware
router.use(authMiddleware);

// GET profile data
router.get('/', async (req, res) => {
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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// PUT profile update
router.put('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = req.user;
    const updates = {};
    const updatedFields = [];

    // Nickname
    if (typeof req.body.nickname === 'string' && req.body.nickname.trim() !== '' && req.body.nickname !== user.nickname) {
      updates.nickname = req.body.nickname.trim();
      updatedFields.push('nickname');
    }

    // Uniquenick
    if (typeof req.body.uniquenick === 'string' && req.body.uniquenick.trim() !== '' && req.body.uniquenick !== user.uniquenick) {
      const newUniquenick = req.body.uniquenick.trim();

      const isValidUniquenick = /^[a-z0-9._]+$/.test(newUniquenick);
      if (!isValidUniquenick) {
        return res.status(400).json({ message: 'Uniquenick can only contain lowercase letters, numbers, underscores, and dots.' });
      }

      updates.uniquenick = newUniquenick;
      updatedFields.push('uniquenick');
    }

    // About me
    if (typeof req.body.about_me === 'string' && req.body.about_me.trim() !== '' && req.body.about_me !== user.about_me) {
      updates.about_me = req.body.about_me.trim().slice(0, 190);
      updatedFields.push('about_me');
    }

    // Profile picture
    if (req.file) {
      // Delete old pic if exists
      if (user.profilePictureUrl) {
        const oldPath = path.join(__dirname, '../../', user.profilePictureUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, err => {
            if (err) console.warn('Error removing old profile picture:', err.message);
          });
        }
      }

      updates.profilePictureUrl = `/user_pfps/${req.file.filename}`;
      updatedFields.push('profilePicture');
    }

    // Nothing to update
    if (updatedFields.length === 0) {
      return res.status(400).json({ message: 'No fields updated.' });
    }

    // Save
    Object.assign(user, updates);
    await user.save();

    res.json({
      message: 'Profile successfully updated!',
      updatedFields,
      profilePictureUrl: user.profilePictureUrl,
      nickname: user.nickname,
      uniquenick: user.uniquenick,
      about_me: user.about_me,
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal error while updating the profile.' });
  }
});

module.exports = router;