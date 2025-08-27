const cron = require('node-cron');
const cleanupIncompleteUsers = require('./cleanupIncompleteUsers');

cron.schedule('0 * * * *', () => {
  console.log('[Cron] Starting cleanup of incomplete accounts...');
  cleanupIncompleteUsers();
});
