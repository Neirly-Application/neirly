const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const User = require('./models/User');
const leoProfanity = require('leo-profanity');
leoProfanity.loadDictionary(); 

require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const SPAM_WINDOW_MS = 5000;
const MAX_MESSAGES = 5;
const CAPS_PERCENTAGE_THRESHOLD = 0.7;
const infractions = new Map();
const logChannelId = process.env.DISCORD_LOG_CHANNEL_ID;

client.once('ready', async () => {
  console.log(`🤖 Bot online as ${client.user.tag}`);
  await updateBotStatus();
  setInterval(updateBotStatus, 5 * 60 * 1000);
});

async function updateBotStatus() {
  try {
    const count = await User.countDocuments();
    client.user.setActivity(`${count} users registered in.`, {
      type: ActivityType.Watching,
    });
  } catch (err) {
    console.error('Error while updating bot status:', err);
  }
}

async function sendLoginMessage(username, discordId) {
  const channelId = process.env.DISCORD_WELCOME_CHANNEL_ID;
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error('❌ Discord channel not found!');
      return;
    }

    channel.send(`🎉 <@${discordId}> has just logged in to the site using **Discord**!`);

    await updateBotStatus();
  } catch (err) {
    console.error('Error sending message or updating bot status:', err);
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = { sendLoginMessage, updateBotStatus };