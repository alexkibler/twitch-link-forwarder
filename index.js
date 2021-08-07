require('dotenv').config({ path: __dirname + '/.env' });
const tmi = require('tmi.js');
const Discord = require('discord.js');
const fs = require('fs');
const DiscordClient = new Discord.Client();
let discordBotReady = false;
let discordChannel;

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', (addr, port) => console.log(`* Connected to ${addr}:${port}`));
DiscordClient.on('ready', discordLoginHandler);


// Connect to Twitch:
client.connect();
DiscordClient.login(process.env.DISCORD_AUTH_TOKEN);

function discordLoginHandler() {
  console.log(`Logged in as ${DiscordClient.user.username}!`);
  discordChannel = DiscordClient.channels.cache.find(i => i.name === process.env.DISCORD_CHANNEL_NAME && i.guild.name === process.env.DISCORD_SERVER_NAME);
  if (discordChannel) {
    console.log('logged into discord.  Channel fetched')
    discordBotReady = true;
  } else {
    errorHandler('Channel ' + process.env.DISCORD_CHANNEL_NAME + ' not found in server ' + process.env.DISCORD_SERVER_NAME)
    throw 'Channel not found!';
  }
}


function onMessageHandler(target, context, msg, self) {
  // Remove whitespace from chat message
  const message = msg.trim();
  if (context.username !== 'streamelements') {
    if (messageContainsLink(message)) {
      const content = `${context.username}@${new Date().toLocaleString()}: ${message}\n`;
      console.log(content);
      if (discordBotReady) {
        discordChannel.send(content)
      }
      //log message to file (if file doesn't exist, create it)
      fs.writeFile('links.txt', content, { flag: 'a+' }, errorHandler);
    }
  }
}

function errorHandler(errMsg) {
  fs.writeFile('errors.txt', errMsg + '\n', { flag: 'a+' }, err => { });
}

function messageContainsLink(message) {
  return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(message)
}