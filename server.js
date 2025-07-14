require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const app = express();
const { authMiddleware } = require('./src/authMiddleware/authMiddleware');
const profileRouter = require('./src/routes/profile');
const notificationsRouter = require('./src/routes/notifications');
const friendsRouter = require('./src/routes/friends');
const privacyRouter = require('./src/routes/privacy');
const activityRouter = require('./src/routes/activity');
const authenticateRouter = require('./src/routes/auth');
const completeProfileRouter = require('./src/routes/completeProfile');
const adminRouter = require('./src/routes/adminRouter');
const forceLogoutRouter = require('./src/routes/forceLogout');
const banUserRouter = require('./src/routes/banUser');
const devicesRouter = require('./src/routes/devices');
const deleteUserRouter = require('./src/routes/deleteUser');
const nearMeRouter = require('./src/routes/nearMe');

require('./src/config/passport');
require('./src/discordBot');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/user_pfps', express.static(path.join(__dirname, 'user_pfps')));
app.use('/api/auth', authenticateRouter);
app.use('/api/auth', completeProfileRouter);
app.use('/api/auth', adminRouter);
app.use('/api/auth', forceLogoutRouter);
app.use('/api/auth', banUserRouter);
app.use('/api', profileRouter);
app.use('/api', deleteUserRouter);
app.use('/api', nearMeRouter);
app.use('/api', notificationsRouter);
app.use('/api', friendsRouter);
app.use('/api', privacyRouter);
app.use('/api', devicesRouter);
app.use('/api', activityRouter);

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
