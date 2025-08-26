const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/* ---------------------------------------------------------------------------
 *  Logging utilities (color-coded output)
 * ------------------------------------------------------------------------- */
const red = '\x1b[31m';
const brightRed = '\x1b[91m';
const yellow = '\x1b[33m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';

const DEBUG = true;
const DEBUG_VERBOSE = false;

const logDebug = msg => DEBUG && console.log(`${red}[DEBUG]${reset} ${msg}`);
const logVerbose = msg => DEBUG_VERBOSE && console.log(`${red}[DEBUG]${reset} ${msg}`);
const logWarn = msg => console.warn(`${yellow}[WARN]${reset} ${msg}`);
const logError = msg => console.error(`${brightRed}[ERROR]${reset} ${msg}`);
const logInfo = msg => console.log(`${blue}[INFO]${reset} ${msg}`);
const logSuccess = msg => console.log(`${green}[SUCCESS]${reset} ${msg}`);

/* ---------------------------------------------------------------------------
 *  Dependency verification & auto-install
 * ------------------------------------------------------------------------- */
const requiredPackages = [
  "bcrypt", "cookie-parser", "cors", "discord.js", "dotenv", "express",
  "express-session", "jsonwebtoken", "leo-profanity", "mongo", "mongoose",
  "multer", "ngrok", "node-fetch", "nodemailer", "passport", "passport-discord",
  "passport-google-oauth20", "passport-local", "ua-parser-js"
];

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
const installedDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

function checkAndInstall(packageName) {
  const isInPackageJson = installedDeps.hasOwnProperty(packageName);
  let isResolvable = false;

  try {
    require.resolve(packageName);
    isResolvable = true;
  } catch (_) {}

  if (isInPackageJson && isResolvable) {
    logInfo(`Package "${packageName}" is already installed.`);
    return;
  }

  logWarn(`Package "${packageName}" is missing or broken. Installing...`);
  const result = spawnSync('npm', ['install', packageName], { stdio: 'inherit' });
  if (result.status !== 0) {
    logError(`Failed to install "${packageName}".`);
    process.exit(1);
  }
  logSuccess(`Installed "${packageName}".`);
}

logDebug("Checking required packages...");
for (const pkg of requiredPackages) {
  checkAndInstall(pkg);
}

/* ---------------------------------------------------------------------------
 *  Environment variables
 * ------------------------------------------------------------------------- */
logDebug("Loading environment variables...");
require('dotenv').config();

/* ---------------------------------------------------------------------------
 *  Core framework imports
 * ------------------------------------------------------------------------- */
logDebug("Importing core modules...");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const pathModule = require('path');

const app = express();

const activeIPs = new Map();
const TIMEOUT = 5000;

app.use('/launch', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  activeIPs.set(ip, Date.now());

  const now = Date.now();
  for (const [ip, lastSeen] of activeIPs.entries()) {
    if (now - lastSeen > TIMEOUT) {
      activeIPs.delete(ip);
    }
  }

  next();
});

app.get('/launch', (req, res) => {
  res.json({ success: true });
});

app.get('/launch-online-users', (req, res) => {
  res.json({ count: activeIPs.size });
});

app.get('/ping', (req, res) => {
  res.json({ pong: true });
});

/* ---------------------------------------------------------------------------
 *  Custom middleware and route imports
 * ------------------------------------------------------------------------- */
const { authMiddleware } = require('./src/auth/authMiddleware.js');

// Developer API (API key)
const profilePublicRouter = require('./src/routes/public/profilePublic.js');
const apiRouter = require('./src/routes/api');

// JWT-protected client APIs
const profileRouter = require('./src/routes/profile');
const notificationsRouter = require('./src/routes/notifications');
const chatsRouter = require('./src/routes/chatsRouter');
const getUser = require('./src/routes/getUserRouter');
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
const searchNickRouter = require('./src/routes/searchNick.js');
const themeRouter = require('./src/routes/themeRouter.js');
const accountSecurity = require('./src/routes/accountSecurityRouter.js');
const postRouter = require('./src/routes/postRouter.js');

/* ---------------------------------------------------------------------------
 *  Additional service initialization
 * ------------------------------------------------------------------------- */
logDebug("Initializing passport configuration...");
require('./src/config/passport');

logDebug("Starting Discord bot...");
require('./src/discordBot');

/* ---------------------------------------------------------------------------
 *  Global middleware
 * ------------------------------------------------------------------------- */
logDebug("Applying global Express middleware...");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(pathModule.join(__dirname, 'public')));
app.use(passport.initialize());

/* ---------------------------------------------------------------------------
 *  DEVELOPER API (versioned)
 *  Public endpoints require API key
 * ------------------------------------------------------------------------- */
const v1 = express.Router();
v1.use('/public', profilePublicRouter);
v1.use('/developer', apiRouter);
app.use('/api/v1', v1);

/* ---------------------------------------------------------------------------
 *  CLIENT API (no version in path)
 *  Used by the web/mobile client after login
 * ------------------------------------------------------------------------- */
app.use('/api/auth', authenticateRouter);
app.use('/api/auth', forceLogoutRouter);
app.use('/api/auth', banUserRouter);
app.use('/api/auth', adminRouter);
app.use('/api/auth', completeProfileRouter);

// Protected client endpoints
app.use('/api', notificationsRouter);
app.use('/api', deleteUserRouter);
app.use('/api', activityRouter);
app.use('/api', profileRouter);
app.use('/api', friendsRouter);
app.use('/api', privacyRouter);
app.use('/api', devicesRouter);
app.use('/api', nearMeRouter);
app.use('/api', chatsRouter);
app.use('/api', getUser);
app.use('/api', searchNickRouter);
app.use('/api', themeRouter);
app.use('/api', accountSecurity);
app.use('/api/posts', postRouter);

/* ---------------------------------------------------------------------------
 *  Static file routes
 * ------------------------------------------------------------------------- */
app.use('/user_pfps', express.static(pathModule.join(__dirname, 'user_pfps')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ---------------------------------------------------------------------------
 *  Root route & 404 handling
 * ------------------------------------------------------------------------- */
app.use(express.static(path.join(__dirname, 'public')));

let rootFile = 'public/countdown/countdown.html';

app.get('/bypass', (req, res) => {
  res.sendFile(pathModule.join(__dirname, 'index.html'));
});
app.get('/', (req, res) => {
  res.sendFile(pathModule.join(__dirname, rootFile));
});

app.post('/switch-root', (req, res) => {
  const allowedOrigin = 'http://localhost:3000';
  const origin = req.get('Origin') || req.get('Referer');

  if (!origin || !origin.startsWith(allowedOrigin)) {
    return res.json({ success: false });
  }

  const now = new Date();
  const targetDateStart = new Date('2026-01-01T00:00:00Z');

  if (now >= targetDateStart) {
    rootFile = 'index.html';
    return res.json({ success: true});
  } else {
    return res.json({ success: false, message: 'What are you trying to do? 👀'  });
  }
});

app.use((req, res) => {
  logWarn(`404 - Not found: ${req.originalUrl}`);
  res.status(404).sendFile(pathModule.join(__dirname, 'public', '404.html'));
});

/* ---------------------------------------------------------------------------
 *  Database connection & server startup
 * ------------------------------------------------------------------------- */
logDebug("JWT_SECRET loaded: " + process.env.JWT_SECRET);
logDebug("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
    logSuccess("MongoDB connection successful");

    const User = require('./src/models/User');
    try {
      await User.syncIndexes();
      logSuccess("User indexes synced successfully");
    } catch (syncErr) {
      logError("Failed to sync User indexes: " + syncErr);
    }

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logSuccess(`Server started on port ${port}`);
    });

    process.stdin.resume();
    process.stdin.pause();
}).catch(err => {
    logError("MongoDB connection error: " + err);
    process.exit(1);
});
