const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

const requiredPackages = [
  "bcrypt",
  "cookie-parser",
  "cors",
  "discord.js",
  "dotenv",
  "express",
  "express-session",
  "jsonwebtoken",
  "leo-profanity",
  "mongo",
  "mongoose",
  "multer",
  "ngrok",
  "node-fetch",
  "nodemailer",
  "passport",
  "passport-discord",
  "passport-google-oauth20",
  "passport-local",
  "ua-parser-js"
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

logDebug("Checking and installing required packages...");
for (const pkg of requiredPackages) {
  checkAndInstall(pkg);
}

logDebug("Loading environment variables...");
require('dotenv').config();

logDebug("Importing core modules...");
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const pathModule = require('path');

const app = express();

logDebug("Importing custom middleware and routers...");
const { authMiddleware } = require('./src/authMiddleware/authMiddleware');
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

logDebug("Initializing passport configuration...");
require('./src/config/passport');

logDebug("Starting Discord bot...");
require('./src/discordBot');

logDebug("Applying express middleware...");
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(pathModule.join(__dirname, 'public')));
app.use(passport.initialize());

logDebug("Registering routes...");
app.use('/user_pfps', express.static(pathModule.join(__dirname, 'user_pfps')));
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
app.use('/api', chatsRouter);
app.use('/api', getUser);

app.get('/', (req, res) => {
  res.sendFile(pathModule.join(__dirname, 'index.html'));
});

logDebug("JWT_SECRET loaded: " + process.env.JWT_SECRET);
logDebug("Connecting to MongoDB...");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    logSuccess("MongoDB connection successful");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logSuccess(`Server started on port ${port}`);
    });

    process.stdin.resume();
    process.stdin.pause();
  })
  .catch((err) => {
    logError("Failed to connect to MongoDB: " + err);
  });

app.use((req, res, next) => {
  logWarn(`404 - Not found: ${req.originalUrl}`);
  res.status(404).sendFile(pathModule.join(__dirname, 'public', '404.html'));
});