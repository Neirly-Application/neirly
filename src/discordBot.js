const fs = require('fs');
const path = require('path');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once('ready', async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);

  const voiceChannelId = process.env.DISCORD_VOICE_CHANNEL_ID;
  const guild = client.guilds.cache.first(); 

  if (!voiceChannelId || !guild) {
    console.error('❌ Voice channel not found.');
    return;
  }

  const voiceChannel = guild.channels.cache.get(voiceChannelId);
  if (!voiceChannel || voiceChannel.type !== 2) {
    console.error('❌ Channel ID not valid.');
    return;
  }

  const songs = fs.readdirSync(path.join(__dirname, 'music')).filter(file => file.endsWith('.mp3'));
  if (songs.length === 0) {
    console.error('❌ No song found in /music.');
    return;
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  } catch (err) {
    console.error('❌ Voice connection failed:', err);
    return;
  }

  const player = createAudioPlayer();
  connection.subscribe(player);

  function playRandomSong() {
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    const filePath = path.join(__dirname, 'music', randomSong);

    const resource = createAudioResource(filePath, {
      inlineVolume: true
    });

    resource.volume.setVolume(0.3);

    console.log(`🎶 Playing: ${randomSong} at 30% volume`);
    player.play(resource);
  }

  playRandomSong();

  player.on(AudioPlayerStatus.Idle, () => {
    console.log('🔁 Song ended. Playing next...');
    setTimeout(playRandomSong, 1000);
  });

  player.on('error', err => {
    console.error('❌ Audio error:', err);
    setTimeout(playRandomSong, 1000);
  });
});

client.login(process.env.DISCORD_BOT_TOKEN);