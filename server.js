require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const app = express();
const profileRouter = require('./src/routes/profile');
const { authMiddleware } = require('./src/authMiddleware/authMiddleware');
const notificationsRouter = require('./src/routes/notifications');
const friendsRouter = require('./src/routes/friends');
const privacyRoutes = require('./src/routes/privacy');

require('./src/config/passport');
require('./src/discordBot');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/auth', require('./src/routes/completeProfile'));
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/profile/delete', authMiddleware, require('./src/routes/deleteUser'));
app.use('/api', authMiddleware, require('./src/routes/dashboard'));
app.use('/api', authMiddleware, require('./src/routes/nearMe'));
app.use('/api/auth', require('./src/routes/adminRoutes'));
app.use('/api/auth', require('./src/routes/forceLogout'));
app.use('/api/auth', require('./src/routes/banUser'));
app.use('/api/notifications', notificationsRouter);
app.use('/api/friends', friendsRouter);
app.use('/api/privacy', privacyRoutes);
app.use('/user_pfps', express.static(path.join(__dirname, 'user_pfps')));
app.use('/api/devices', require('./src/routes/devices'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
console.log('JWT_SECRET:', process.env.JWT_SECRET);
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT||3000, () => console.log('✅ Server starter on port' + " " + process.env.PORT));
    process.stdin.resume();
    process.stdin.pause();
  })
.catch(console.error);

app.use((req, res, next) => {
  console.warn(`404 - Not found: ${req.originalUrl}`);
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
