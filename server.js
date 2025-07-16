const DEBUG = true;
const DEBUG_VERBOSE = false;

if (DEBUG) console.log("[DEBUG] Loading environment variables...");
require('dotenv').config();

if (DEBUG) console.log("[DEBUG] Importing core modules...");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');

const app = express();

if (DEBUG) console.log("[DEBUG] Importing custom middleware and routers...");

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing authMiddleware...");
const { authMiddleware } = require('./src/authMiddleware/authMiddleware');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing profileRouter...");
const profileRouter = require('./src/routes/profile');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing notificationsRouter...");
const notificationsRouter = require('./src/routes/notifications');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing friendsRouter...");
const friendsRouter = require('./src/routes/friends');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing privacyRouter...");
const privacyRouter = require('./src/routes/privacy');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing activityRouter...");
const activityRouter = require('./src/routes/activity');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing authenticateRouter...");
const authenticateRouter = require('./src/routes/auth');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing completeProfileRouter...");
const completeProfileRouter = require('./src/routes/completeProfile');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing adminRouter...");
const adminRouter = require('./src/routes/adminRouter');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing forceLogoutRouter...");
const forceLogoutRouter = require('./src/routes/forceLogout');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing banUserRouter...");
const banUserRouter = require('./src/routes/banUser');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing devicesRouter...");
const devicesRouter = require('./src/routes/devices');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing deleteUserRouter...");
const deleteUserRouter = require('./src/routes/deleteUser');

if (DEBUG_VERBOSE) console.log("[DEBUG] Importing nearMeRouter...");
const nearMeRouter = require('./src/routes/nearMe');

if (DEBUG) console.log("[DEBUG] Initializing passport configuration...");
require('./src/config/passport');

if (DEBUG) console.log("[DEBUG] Starting Discord bot...");
require('./src/discordBot');

if (DEBUG) console.log("[DEBUG] Applying express middleware...");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

if (DEBUG) console.log("[DEBUG] Registering routes...");
app.use('/user_pfps', express.static(path.join(__dirname, 'user_pfps')));
app.use('/api/auth', authenticateRouter);
app.use('/api/auth', forceLogoutRouter);
app.use('/api/auth', banUserRouter);
app.use('/api/auth', adminRouter);
app.use('/api/auth', completeProfileRouter);
app.use('/api', notificationsRouter);
app.use('/api', deleteUserRouter);
app.use('/api', activityRouter);
app.use('/api', profileRouter);
app.use('/api', friendsRouter);
app.use('/api', privacyRouter);
app.use('/api', devicesRouter);
app.use('/api', nearMeRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (DEBUG) console.log("[DEBUG] JWT_SECRET loaded:", process.env.JWT_SECRET);
if (DEBUG) console.log("[DEBUG] Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    if (DEBUG) console.log("[DEBUG] MongoDB connection successful");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log("Server started on port", port);
    });

    process.stdin.resume();
    process.stdin.pause();
  })
  .catch((err) => {
    console.error("[ERROR] Failed to connect to MongoDB:", err);
  });

app.use((req, res, next) => {
  console.warn("[WARN] 404 - Not found:", req.originalUrl);
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
