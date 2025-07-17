const red = '\x1b[31m';
const brightRed = '\x1b[91m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

const DEBUG = true;
const DEBUG_VERBOSE = false;

const logDebug = msg => DEBUG && console.log(`${red}[DEBUG]${reset} ${msg}`);
const logVerbose = msg => DEBUG_VERBOSE && console.log(`${red}[DEBUG]${reset} ${msg}`);
const logWarn = msg => console.warn(`${yellow}[WARN]${reset} ${msg}`);
const logError = msg => console.error(`${brightRed}[ERROR]${reset} ${msg}`);
const logInfo = msg => console.log(`${green}[INFO]${reset} ${msg}`);

logDebug("Loading environment variables...");
require('dotenv').config();

logDebug("Importing core modules...");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');

const app = express();

logDebug("Importing custom middleware and routers...");
logVerbose("Importing authMiddleware...");
const { authMiddleware } = require('./src/authMiddleware/authMiddleware');

logVerbose("Importing profileRouter...");
const profileRouter = require('./src/routes/profile');

logVerbose("Importing notificationsRouter...");
const notificationsRouter = require('./src/routes/notifications');

logVerbose("Importing friendsRouter...");
const friendsRouter = require('./src/routes/friends');

logVerbose("Importing privacyRouter...");
const privacyRouter = require('./src/routes/privacy');

logVerbose("Importing activityRouter...");
const activityRouter = require('./src/routes/activity');

logVerbose("Importing authenticateRouter...");
const authenticateRouter = require('./src/routes/auth');

logVerbose("Importing completeProfileRouter...");
const completeProfileRouter = require('./src/routes/completeProfile');

logVerbose("Importing adminRouter...");
const adminRouter = require('./src/routes/adminRouter');

logVerbose("Importing forceLogoutRouter...");
const forceLogoutRouter = require('./src/routes/forceLogout');

logVerbose("Importing banUserRouter...");
const banUserRouter = require('./src/routes/banUser');

logVerbose("Importing devicesRouter...");
const devicesRouter = require('./src/routes/devices');

logVerbose("Importing deleteUserRouter...");
const deleteUserRouter = require('./src/routes/deleteUser');

logVerbose("Importing nearMeRouter...");
const nearMeRouter = require('./src/routes/nearMe');

logDebug("Initializing passport configuration...");
require('./src/config/passport');

logDebug("Starting Discord bot...");
require('./src/discordBot');

logDebug("Applying express middleware...");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

logDebug("Registering routes...");
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

logDebug("JWT_SECRET loaded: " + process.env.JWT_SECRET);
logDebug("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    logDebug("MongoDB connection successful");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log("✅ Server started on port", port);
    });

    process.stdin.resume();
    process.stdin.pause();
  })
  .catch((err) => {
    logError("Failed to connect to MongoDB: " + err);
  });

app.use((req, res, next) => {
  logWarn(`404 - Not found: ${req.originalUrl}`);
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});