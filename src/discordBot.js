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
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

let player;
let songs;
let currentResource;
let voiceChannel;
let lastNowPlayingMessage = null;
let isSongReported = false;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);

  try {
    const voiceChannelId = process.env.DISCORD_VOICE_CHANNEL_ID;
    const guild = client.guilds.cache.first();

    if (!voiceChannelId || !guild) {
      console.error('❌ Voice channel or guild not found.');
      return;
    }

    voiceChannel = guild.channels.cache.get(voiceChannelId);
    if (!voiceChannel || voiceChannel.type !== 2) {
      console.error('❌ Invalid voice channel.');
      return;
    }

    songs = fs.readdirSync(path.join(__dirname, 'music')).filter(file => file.endsWith('.mp3'));
    if (songs.length === 0) {
      console.error('❌ No songs found in /music.');
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
      console.error('❌ Failed to connect to voice channel:', err);
      return;
    }

    player = createAudioPlayer();
    connection.subscribe(player);

    async function playRandomSong() {
      try {
        isSongReported = false;

        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        const filePath = path.join(__dirname, 'music', randomSong);
        const songName = randomSong.replace(/\.mp3$/i, '');

        currentResource = createAudioResource(filePath, {
          inlineVolume: true,
          metadata: { songName }
        });

        currentResource.volume.setVolume(0.3);

        console.log(`🎶 Playing: ${randomSong}`);
        player.play(currentResource);

        client.user.setActivity(`🎶 Playing "${songName}" while developers are coding!`, { type: 4 });

        const embed = new EmbedBuilder()
          .setColor(0x3498DB)
          .setDescription(`🎵 Now Playing **${songName}**`);

        const components = [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('skip_song')
              .setLabel('Skip ▶️')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('report_song')
              .setLabel('Report 🚩')
              .setStyle(ButtonStyle.Danger)
              .setDisabled(isSongReported) 
          )
        ];

        if (lastNowPlayingMessage) {
          try {
            lastNowPlayingMessage = await lastNowPlayingMessage.edit({ embeds: [embed], components });
          } catch (err) {
            console.error('Failed to edit previous now playing message, sending a new one.', err);
            lastNowPlayingMessage = await voiceChannel.send({ embeds: [embed], components });
          }
        } else {
          lastNowPlayingMessage = await voiceChannel.send({ embeds: [embed], components });
        }
      } catch (err) {
        console.error('Error in playRandomSong:', err);
      }
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

    client.on('messageCreate', async (message) => {
      try {
        const DJ_ROLE_ID = process.env.DISCORD_DJ_ROLE_ID;
        if (message.author.bot || !message.guild) return;

        const args = message.content.trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        const member = message.guild.members.cache.get(message.author.id);
        const hasDJRole = member?.roles.cache.has(DJ_ROLE_ID);

        if (!hasDJRole && (command === '!skip' || command === '!volume')) {
          return message.reply({
            embeds: [
              new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🚫 Permission Denied')
                .setDescription('You need the **DJ Role** to use this command.')
            ]
          });
        }

        if (command === '!skip') {
          if (player) {
            isSongReported = false;

            if (lastNowPlayingMessage) {
              try {
                await lastNowPlayingMessage.delete();
              } catch (err) {
                console.error('Failed to delete previous now playing message:', err);
              }
              lastNowPlayingMessage = null;
            }

            await message.channel.send('⏭️ Skipping to next song...');
            player.stop();
          } else {
            message.channel.send('⚠️ No song is currently playing.');
          }
        }

        if (command === '!volume') {
          const volumeArg = args[0];

          if (!volumeArg || volumeArg.toLowerCase() === 'default' || volumeArg.toLowerCase() === 'reset') {
            if (currentResource && currentResource.volume) {
              currentResource.volume.setVolume(0.3);
              return message.channel.send('🔊 Volume reset to default (30%)');
            } else {
              return message.channel.send('⚠️ No audio is currently playing.');
            }
          }

          const volume = parseInt(volumeArg, 10);

          if (isNaN(volume) || volume < 0 || volume > 200) {
            return message.channel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(0xFFA500)
                  .setTitle('❌ Invalid Volume')
                  .setDescription('Please enter a number between **0** and **200**, or type `default` to reset.')
              ]
            });
          }

          if (currentResource && currentResource.volume) {
            currentResource.volume.setVolume(volume / 100);
            message.channel.send(`🔊 Volume set to **${volume}%**`);
          } else {
            message.channel.send('⚠️ No audio is currently playing.');
          }
        }
      } catch (err) {
        console.error('Error handling messageCreate:', err);
      }
    });

    client.on('interactionCreate', async (interaction) => {
      try {
        if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

        if (interaction.customId === 'report_song') {
          const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('report_reason')
              .setPlaceholder('Select a reason to report this song')
              .addOptions([
                { label: 'Too sad', value: 'too_sad' },
                { label: 'Not a chilling song', value: 'not_chill' },
                { label: 'Bad quality', value: 'bad_quality' }
              ])
          );

          await interaction.reply({
            content: '🚨 Please choose a reason for reporting this song:',
            components: [selectMenu],
            ephemeral: true
          });
        }

        if (interaction.customId === 'report_reason') {
          const selectedReason = interaction.values[0];
          const user = interaction.user;
          const songName = currentResource?.metadata?.songName || 'Unknown Song';

          await interaction.update({
            content: `✅ Report submitted for **${songName}** with reason: **${selectedReason.replace(/_/g, ' ')}**`,
            components: []
          });

          isSongReported = true;

          if (lastNowPlayingMessage) {
            try {
              const disabledComponents = [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId('skip_song')
                    .setLabel('Skip ▶️')
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId('report_song')
                    .setLabel('Report 🚩')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
                )
              ];
              await lastNowPlayingMessage.edit({ components: disabledComponents });
            } catch (err) {
              console.error('❌ Failed to disable report button:', err);
            }
          }

          const reportChannelId = process.env.DISCORD_REPORT_CHANNEL_ID;
          const reportChannel = interaction.guild.channels.cache.get(reportChannelId);

          if (reportChannel && reportChannel.isTextBased()) {
            const embed = new EmbedBuilder()
              .setTitle('🎧 Song Report')
              .setColor(0xE74C3C)
              .addFields(
                { name: 'Reported by', value: `<@${user.id}>`, inline: true },
                { name: 'Reason', value: selectedReason.replace(/_/g, ' '), inline: true },
                { name: 'Song', value: songName }
              )
              .setTimestamp();

            await reportChannel.send({ embeds: [embed] });
          } else {
            console.error('❌ Report channel not found or not text-based.');
          }
        }

        if (interaction.customId === 'skip_song') {
          const DJ_ROLE_ID = process.env.DISCORD_DJ_ROLE_ID;
          const member = interaction.guild.members.cache.get(interaction.user.id);

          if (!member.roles.cache.has(DJ_ROLE_ID)) {
            return interaction.reply({ content: '⛔ You need the **DJ Role** to skip songs.', ephemeral: true });
          }

          if (player) {
            isSongReported = false;
            player.stop();
            await interaction.reply({ content: '⏭️ Skipped the song!', ephemeral: true });

            if (lastNowPlayingMessage) {
              try {
                const disabledComponents = [
                  new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                      .setCustomId('skip_song')
                      .setLabel('Skip ▶️')
                      .setStyle(ButtonStyle.Primary)
                      .setDisabled(true),
                    new ButtonBuilder()
                      .setCustomId('report_song')
                      .setLabel('Report 🚩')
                      .setStyle(ButtonStyle.Danger)
                      .setDisabled(true)
                  )
                ];
                await lastNowPlayingMessage.edit({ components: disabledComponents });
              } catch (err) {
                console.error('Failed to disable skip button:', err);
              }
            }
          } else {
            return interaction.reply({ content: '⚠️ No song is currently playing.', ephemeral: true });
          }
        }
      } catch (err) {
        console.error('Error handling interactionCreate:', err);
      }
    });

  } catch (err) {
    console.error('Error during client ready:', err);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);