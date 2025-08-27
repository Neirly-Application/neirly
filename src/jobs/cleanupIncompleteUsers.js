const User = require('../models/User');

async function cleanupIncompleteUsers() {
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await User.deleteMany({
      profileCompleted: false,
      createdAt: { $lt: cutoff }
    });
    console.log(`[Cleanup] Deleted ${result.deletedCount} incomplete accounts.`);
  } catch (err) {
    console.error('[Cleanup] Error during cleanup:', err);
  }
}

module.exports = cleanupIncompleteUsers;
