const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Notification = require('../models/Notification');

async function generateUniqueNick(base) {
  let clean = base
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9._]/g, '')
    .substring(0, 20);

  let uniquenick = clean;
  let counter = 1;

  while (await User.findOne({ uniquenick })) {
    uniquenick = `${clean}_${Math.floor(Math.random() * 10000)}`;
    counter++;
    if (counter > 10) break;
  }

  return uniquenick;
}

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    let user = await User.findOne({ email });

    if (user) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      return done(null, isValid ? user : false);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const uniquenick = await generateUniqueNick(email.split('@')[0]);

    const newUser = await User.create({
      email,
      name: email.split('@')[0],
      uniquenick,
      passwordHash: hashedPassword,
      provider: 'local',
      profileCompleted: false,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}! This is just a simple welcome notification. Don't take care of what there's in here thanks :3`,
      imageUrl: '../media/notification.png'
    });

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let user = await User.findOne({ email });

    if (user) {
      if (!user.name || user.name.trim() === '') {
        user.name = profile.displayName || 'User';
        await user.save();
      }
      return done(null, user);
    }

    const baseNick = profile.displayName || 'user';
    const uniquenick = await generateUniqueNick(baseNick);

    const newUser = await User.create({
      email,
      name: profile.displayName || 'User',
      uniquenick,
      discordId: null,
      passwordHash: '',
      provider: 'google',
      profileCompleted: false,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}! This is just a simple welcome notification. Don't take care of what there's in here thanks :3`,
      imageUrl: '../media/notification.png'
    });

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: '/api/auth/discord/callback',
  scope: ['identify', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.email;
    if (!email) {
      return done(null, false, { message: 'Email non disponibile da Discord.' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.discordId) {
        user.discordId = profile.id;
        if (!user.provider) user.provider = 'discord';
        await user.save();
      } else if (user.discordId !== profile.id) {
        return done(null, false, { message: 'Discord ID mismatch con account esistente.' });
      }
      return done(null, user);
    }

    const baseNick = profile.username || 'user';
    const uniquenick = await generateUniqueNick(baseNick);

    const newUser = await User.create({
      email,
      name: profile.username,
      uniquenick,
      discordId: profile.id,
      passwordHash: '',
      provider: 'discord',
      profileCompleted: false,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}! This is just a simple welcome notification. Don't take care of what there's in here thanks :3`,
      imageUrl: '../media/notification.png'
    });

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;