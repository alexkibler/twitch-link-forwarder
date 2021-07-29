require('dotenv').config({path: __dirname + '/.env'});
const tmi = require('tmi.js');
const Discord = require('discord.js');
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
client.on('connected', onConnectedHandler);
DiscordClient.on('ready', discordLoginHandler);


// Connect to Twitch:
client.connect();
DiscordClient.login(process.env.DISCORD_AUTH_TOKEN);

function discordLoginHandler() {
    console.log(`Logged in as ${DiscordClient.user.username}!`);
    discordChannel = DiscordClient.channels.cache.find(i => i.name === process.env.DISCORD_CHANNEL_NAME && i.guild?.name === process.env.DISCORD_SERVER_NAME);
    if (!discordChannel) {
        throw 'Channel not found!'
    }
    console.log('logged into discord.  Channel fetched')
    discordBotReady = true;    
}


// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const message = msg.trim();

  // If the command is known, let's execute it
  if (messageContainsLink(message)) {
    // client.say(target, `Link det`);
    console.log(`* Link detected from ${context.username}: `)
    console.log(message);
    if (discordBotReady) {
        //send message to discord
        discordChannel.send(`${context.username}: ${message}`)
    }
  } else {
      console.log(`${context.username}: ${message}`)
  }
}

function messageContainsLink(message) {
  return new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?").test(message)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
