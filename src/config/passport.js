const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

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

// ================= LOCAL STRATEGY =================
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
      message: `Welcome ${newUser.name || newUser.email}!`,
      imageUrl: '../media/notification.webp'
    });

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}));

// ================= GOOGLE STRATEGY =================
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) user.googleId = profile.id;
      if (!user.name || user.name.trim() === '') {
        user.name = profile.displayName || user.name;
      }
      if (!user.provider) user.provider = 'google';

      await user.save();
      return done(null, user);
    }

    const baseNick = profile.displayName || 'user';
    const uniquenick = await generateUniqueNick(baseNick);

    const newUser = await User.create({
      email,
      name: profile.displayName || 'User',
      oauthPasswordChanged: false,
      uniquenick,
      googleId: profile.id,
      discordId: null,
      passwordHash: '',
      provider: 'google',
      profileCompleted: false,
      acceptedTerms: true,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}!`,
      imageUrl: '../media/notification.webp'
    });

    done(null, newUser);
  } catch (err) {
    done(err, null);
  }
}));

// ================= DISCORD STRATEGY =================
passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: '/api/auth/discord/callback',
  scope: ['identify', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.email;
    if (!email) {
      return done(null, false, { message: 'Email not available by Discord.' });
    }

    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp`
      : `https://cdn.discordapp.com/embed/avatars/${profile.discriminator % 5}.webp`;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.discordId) user.discordId = profile.id;
      if (!user.provider) user.provider = 'discord';

      // aggiorno avatar solo se non c'è già
      if (!user.profilePictureUrl) {
        user.profilePictureUrl = avatarUrl;
      }

      await user.save();
      return done(null, user);
    }

    const baseNick = profile.username || 'user';
    const uniquenick = await generateUniqueNick(baseNick);

    const newUser = await User.create({
      email,
      name: profile.username,
      oauthPasswordChanged: false,
      uniquenick,
      googleId: null,
      discordId: profile.id,
      passwordHash: '',
      provider: 'discord',
      profileCompleted: true,
      acceptedTerms: true,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
      profilePictureUrl: avatarUrl
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}!`,
      imageUrl: '../media/notification.webp'
    });

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}));

// ================= FACEBOOK STRATEGY =================
/*passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'displayName', 'photos'] // Importante per avere email e nome
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(null, false, { message: 'Email not available by Facebook.' });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.facebookId) user.facebookId = profile.id;
      if (!user.provider) user.provider = 'facebook';

      if (!user.profilePictureUrl && profile.photos?.[0]?.value) {
        user.profilePictureUrl = profile.photos[0].value;
      }

      await user.save();
      return done(null, user);
    }

    const baseNick = profile.displayName || 'user';
    const uniquenick = await generateUniqueNick(baseNick);

    const newUser = await User.create({
      email,
      name: profile.displayName || 'User',
      oauthPasswordChanged: false,
      uniquenick,
      googleId: null,
      discordId: null,
      facebookId: profile.id,
      passwordHash: '',
      provider: 'facebook',
      profileCompleted: true,
      acceptedTerms: true,
      join_date: new Date(),
      roles: ['user'],
      banned: false,
      forceLogout: false,
      about_me: "👋 Hello there! I'm a Neirly user!",
      profilePictureUrl: profile.photos?.[0]?.value || '/media/user.webp'
    });

    await Notification.create({
      userId: newUser._id,
      message: `Welcome ${newUser.name || newUser.email}!`,
      imageUrl: '../media/notification.webp'
    });

    return done(null, newUser);
  } catch (err) {
    return done(err);
  }
}));*/

module.exports = passport;