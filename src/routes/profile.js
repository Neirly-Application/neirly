const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../authMiddleware/authMiddleware');

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

router.get('/', async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      birthdate: user.birthdate,
      nickname: user.nickname,
      roles: user.roles,
      profilePictureUrl: user.profilePictureUrl || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.put('/', upload.single('profilePicture'), async (req, res) => {
  try {
    const user = req.user;
    const updates = {};
    const updatedFields = [];

    if (typeof req.body.nickname === 'string' && req.body.nickname.trim() !== '' && req.body.nickname !== user.nickname) {
      updates.nickname = req.body.nickname.trim();
      updatedFields.push('nickname');
    }

    if (req.file) {
      if (user.profilePictureUrl) {
        const oldPath = path.join(__dirname, '../../', user.profilePictureUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlink(oldPath, err => {
            if (err) console.warn('Errore nel rimuovere la vecchia immagine:', err.message);
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
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Internal error while updating the profile.' });
  }
});

module.exports = router;