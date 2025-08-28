const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getLocationFromIP = require('../utils/getLocationFromIP');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLogs');
const { authMiddleware } = require('../auth/authMiddleware');
const { sendLoginMessage } = require('../discordBot');
const Message = require('../models/Message');

const OAUTH_SECRET = process.env.OAUTH_SECRET;

// ================= REGISTER (LOCALE) =================
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ email, passwordHash: hash, roles: 'user', oauthPasswordChanged: true });
    await user.save();

    await ActivityLog.create({
      userId: user._id,
      type: 'register',
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
      }
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      message: 'Registration successfully completed!',
      user: {
        id: user._id,
        email: user.email,
        profileCompleted: user.profileCompleted,
        roles: user.roles,
        banned: user.banned,
        oauthPasswordChanged: true,
        profilePictureUrl: '/media/user.webp'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error while registering.' });
  }
});

// ================= LOGIN (LOCALE) =================
router.post('/login', async (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Internal error.' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isOAuthOnly = await bcrypt.compare(OAUTH_SECRET, user.passwordHash);
    if (isOAuthOnly) {
      return res.status(403).json({
        message: 'This account is registered with Google/Discord. Use those methods to log in.'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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
        user.devices.push({ name: userAgent, location, lastActive: new Date() });
      }
      await user.save();

      await ActivityLog.create({
        userId: user._id,
        type: 'login',
        metadata: { provider: 'local', email: user.email, ip }
      });
    } catch (err) {
      console.error('Error saving login device:', err.message);
    }

    const redirectUrl = req.session?.returnTo || '/';
    if (req.session) delete req.session.returnTo;

    res.json({
      message: 'Login successfully completed!',
      redirectUrl,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        uniquenick: user.uniquenick,
        profileCompleted: user.profileCompleted,
        roles: user.roles,
        banned: user.banned,
        oauthPasswordChanged: user.oauthPasswordChanged,
        profilePictureUrl: '/media/user.webp'
      }
    });
  })(req, res, next);
});

// ================= LOGOUT =================
router.post('/logout', async (req, res) => {
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

// ================= DELETE ACCOUNT =================
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      Notification.deleteMany({ userId }),
      ActivityLog.deleteMany({ userId }),
      Message.deleteMany({ $or: [{ sender: userId }, { recipient: userId }] }),
    ]);

    await Promise.all([
      User.updateMany({}, { $pull: { friends: userId } }),
      User.updateMany({}, { $pull: { friendRequestsReceived: userId } }),
      User.updateMany({}, { $pull: { friendRequestsSent: userId } }),
      User.updateMany({}, { $pull: { recentChats: userId } }),
      User.updateMany({}, { $pull: { lastSearches: userId } }),
    ]);

    await User.findByIdAndDelete(userId);

    res.clearCookie('token');

    await ActivityLog.create({
      userId,
      type: 'account_deletion',
      metadata: {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip
      }
    });

    res.json({ message: 'All account datas have been successfully deleted!' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error while deleting account.' });
  }
});


// ================= PROFILE =================
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
      profilePictureUrl: '/media/user.webp'
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Errore nel recupero profilo.' });
  }
});

// ================= GOOGLE OAUTH =================
router.get('/google', (req, res, next) => {
  if (req.query.redirect) req.session.returnTo = req.query.redirect;
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/register.html' }),
  async (req, res) => {
    try {
      if (!req.user.passwordHash) {
        req.user.passwordHash = await bcrypt.hash(OAUTH_SECRET, 10);
        req.user.oauthPasswordChanged = false;
        await req.user.save();
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await ActivityLog.create({
        userId: req.user._id,
        type: 'login',
        metadata: { provider: 'google', email: req.user.email }
      });

      const redirectUrl = req.session?.returnTo || (
        !req.user.profileCompleted ? `/main/complete-profile.html` : `/main/app.html`
      );
      if (req.session) delete req.session.returnTo;

      return res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google token error:', error);
      return res.redirect('/register.html');
    }
  }
);

// ================= DISCORD OAUTH =================
router.get('/discord', passport.authenticate('discord', { scope: ['identify', 'email'] }));

router.get('/discord/callback',
  passport.authenticate('discord', { session: false, failureRedirect: '/login.html?error=discord' }),
  async (req, res) => {
    try {
      if (!req.user.passwordHash) {
        req.user.passwordHash = await bcrypt.hash(OAUTH_SECRET, 10);
        req.user.oauthPasswordChanged = false;
        await req.user.save();
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await ActivityLog.create({
        userId: req.user._id,
        type: 'login',
        metadata: { provider: 'discord', email: req.user.email }
      });

      sendLoginMessage(req.user.name || req.user.email, req.user.discordId);

      if (!req.user.profileCompleted) return res.redirect(`/main/complete-profile.html`);
      return res.redirect(`/main/app.html`);
    } catch (error) {
      console.error('Discord token error:', error);
      return res.redirect('/login.html?error=token');
    }
  }
);

// ================= FACEBOOK OAUTH =================
//router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

/*router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false, failureRedirect: '/login.html?error=facebook' }),
  async (req, res) => {
    try {
      if (!req.user.passwordHash) {
        req.user.passwordHash = await bcrypt.hash(OAUTH_SECRET, 10);
        req.user.oauthPasswordChanged = false;
        await req.user.save();
      }

      const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      await ActivityLog.create({
        userId: req.user._id,
        type: 'login',
        metadata: { provider: 'facebook', email: req.user.email }
      });

      if (!req.user.profileCompleted) return res.redirect(`/main/complete-profile.html`);
      return res.redirect(`/main/app.html`);
    } catch (error) {
      console.error('Facebook token error:', error);
      return res.redirect('/login.html?error=token');
    }
  }
);*/

module.exports = router;