const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { authMiddleware } = require('../auth/authMiddleware');
const User = require('../models/User');

const upload = multer({
  dest: path.join(__dirname, '../../uploads/user/'),
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
      oauthPasswordChanged: user.oauthPasswordChanged,
      uniquenick: user.uniquenick,
      profileCompleted: user.profileCompleted,
      roles: user.roles,
      profilePictureUrl: user.profilePictureUrl || null,
      about_me: user.about_me || '',
      bioLimit: user.bioLimit,
      uniquenickChangedAt: user.uniquenickChangedAt || null,
      provider: user.provider || 'Not set',
      acceptedTerms: !!user.acceptedTerms,
      join_date: user.join_date || null,
      coins: typeof user.coins === 'number' ? user.coins : 0,
      hasPremium: !!user.hasPremium,
      theme: user.theme || 'dark'
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

    // --- NICKNAME ---
    if (
      typeof req.body.name === 'string' &&
      req.body.name.trim() !== '' &&
      req.body.name !== user.name
    ) {
      updates.name = req.body.name.trim();
      updatedFields.push('name');
    }

    // --- UNIQUENICK ---
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
          message: 'Nickname can only contain lowercase letters, numbers, underscores, and dots.',
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

    // --- ABOUT ME ---
    if (
      typeof req.body.about_me === 'string' &&
      req.body.about_me.trim() !== '' &&
      req.body.about_me !== user.about_me
    ) {
      updates.about_me = req.body.about_me.trim().slice(0, 190);
      updatedFields.push('about_me');
    }

    // --- PROFILE PICTURE ---
    if (req.file) {
      if (user.profilePictureUrl) {
        const oldPath = path.join(__dirname, '../../', user.profilePictureUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, (err) => {
            if (err) console.warn('Error removing old profile picture:', err.message);
          });
        }
      }

      const outputDir = path.resolve(__dirname, '../../uploads/user');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const newFilename = `${Date.now()}-${user._id}.webp`;
      const outputPath = path.join(outputDir, newFilename);

      await sharp(req.file.path)
        .resize(512, 512, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(outputPath);

      fs.unlink(req.file.path, (err) => {
        if (err) console.warn('Error removing temp upload:', err.message);
      });

      updates.profilePictureUrl = `/uploads/user/${newFilename}`;
      updatedFields.push('profilePicture');
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ message: 'No fields updated.' });
    }

    Object.assign(user, updates);
    await user.save();

    res.json({
      success: true,
      message: 'Profile successfully updated!',
      updatedFields,
      profilePictureUrl: user.profilePictureUrl,
      name: user.name,
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
