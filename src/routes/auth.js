const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getLocationFromIP = require('../utils/getLocationFromIP');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware, requireRole } = require('../authMiddleware/authMiddleware');
const ActivityLog = require('../models/ActivityLogs');
const { sendLoginMessage } = require('../discordBot');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash: hash, roles: 'user' });
    await user.save();
    await ActivityLog.create({
      userId: user._id,
      type: 'login',
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
      }
    });
    res.json({ message: 'Registration successfully completed!' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error while registering.' });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal error.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Credenziali errate' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict'
    });
    
    (async function handleDeviceSave() {
      try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const location = await getLocationFromIP(ip);
      
        const existingDevice = user.devices.find(dev =>
          dev.name === userAgent && dev.location === location
        );
      
        if (existingDevice) {
          existingDevice.lastActive = new Date();
        } else {
          user.devices.push({
            name: userAgent,
            location,
            lastActive: new Date()
          });
        }
      
        await user.save();
        console.log('✅ Device saved');
      } catch (err) {
        console.error('Error saving login device:', err.message);
      }
    })();

    res.json({
      message: 'Login successfully completed!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        uniquenick: user.uniquenick,
        profileCompleted: user.profileCompleted,
        roles: user.roles,
        banned: user.banned,
        profilePictureUrl: '/media/user.png',
      }
    });
  })(req, res, next);
});

router.post('/logout', authMiddleware, async (req, res) => {
  res.clearCookie('token'); 

  if (req.user) {
    await ActivityLog.create({
      userId: req.user._id,
      type: 'logout',
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
      }
    });
  }
  res.json({ message: 'Logged out successfully!' });
});

router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.clearCookie('token');
    await ActivityLog.create({
      userId: req.user._id,
      type: 'logout & deleting account',
      metadata: {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
      }
    });
    res.json({ message: 'Account and related notifications successfully deleted.' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error while deleting account.' });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      id: user._id,
      name: user.name,
      uniquenick: user.uniquenick,
      email: user.email,
      birthdate: user.birthdate,
      nickname: user.nickname,
      roles: user.roles,
      banned: false,
      profilePictureUrl: '/media/user.png',
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Errore nel recupero profilo.' });
  }
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/register.html' }),
  async (req, res) => {
    try {
      console.log('User from Google:', req.user);
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });
      try {
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const location = await getLocationFromIP(ip);
        const existingDevice = req.user.devices.find(dev =>
          dev.name === userAgent && dev.location === location
        );
        if (existingDevice) {
          existingDevice.lastActive = new Date();
        } else {
          req.user.devices.push({
            name: userAgent,
            location,
            lastActive: new Date()
          });
        }
        await req.user.save();
        await ActivityLog.create({
          userId: req.user._id,
          type: 'login',
          metadata: {
            provider: 'google',
            email: req.user.email,
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
          }
        });
        console.log('✅ Device saved (Google)');
      } catch (err) {
        console.error('Device tracking error (Google):', err.message);
      }

      if (!req.user.profileCompleted) {
        return res.redirect(`/main/complete-profile.html?userId=${req.user._id}`);
      }

      return res.redirect(`/main/main.html?name=${encodeURIComponent(req.user.name || 'User')}`);
    } catch (error) {
      console.error('Google token error:', error);
      return res.redirect('/register.html');
    }
  }
);

router.get('/discord', passport.authenticate('discord', {
  scope: ['identify', 'email']
}));

router.get('/discord/callback',
  passport.authenticate('discord', { session: false, failureRedirect: '/login.html?error=discord' }),
    async (req, res) => {
    try {
      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      (async function saveDiscordDevice() {
        try {
          const userAgent = req.headers['user-agent'] || 'Unknown';
          const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
          const location = await getLocationFromIP(ip);
        
          const existingDevice = req.user.devices.find(dev =>
            dev.name === userAgent && dev.location === location
          );
        
          if (existingDevice) {
            existingDevice.lastActive = new Date();
          } else {
            req.user.devices.push({
              name: userAgent,
              location,
              lastActive: new Date()
            });
          }
        
          await req.user.save();
          await ActivityLog.create({
            userId: req.user._id,
            type: 'login',
            metadata: {
              provider: 'discord',
              email: req.user.email,
              ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
            }
          });
          console.log('✅ Discord device saved');
        } catch (err) {
          console.error('Error saving Discord login device:', err.message);
        }
      })();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });

      sendLoginMessage(req.user.name || req.user.email, req.user.discordId);

      if (!req.user.profileCompleted) {
        return res.redirect(`/main/complete-profile.html?userId=${req.user._id}&nickname=${encodeURIComponent(req.user.name)}`);
      }

      return res.redirect(`/main/main.html?name=${encodeURIComponent(req.user.name || 'User')}`);
    } catch (error) {
      console.error('Discord token error:', error);
      return res.redirect('/login.html?error=token');
    }
  }
);

router.get('/admin-only', authMiddleware, requireRole('ceo'), (req, res) => {
  res.json({ message: `Benvenuto CEO ${req.user.name}` });
});

router.put('/set-role', authMiddleware, requireRole('ceo'), async (req, res) => {
  const { userId, newRole } = req.body;

  if (!['user', 'supporter', 'moderator', 'ceo'].includes(newRole)) {
    return res.status(400).json({ message: 'Ruolo non valido.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utente non trovato.' });

    user.roles = newRole;
    await user.save();

    res.json({ message: `Ruolo aggiornato a ${newRole} per ${user.email}` });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante aggiornamento ruolo.' });
  }
});

module.exports = router;
