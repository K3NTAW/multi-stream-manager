const tmi = require('tmi.js');
const { io } = require('socket.io-client');
const { env } = require('../../src/lib/env');

class StreamManager {
  twitchConnected = false;
  youtubeConnected = false;
  kickConnected = false;
  twitchClient = null;
  onMessageCallback = null;

  constructor() {
    // Public constructor
  }

  connectTwitch(channel, token) {
    console.log(`Connecting to Twitch channel: ${channel}`);

    this.twitchClient = new tmi.Client({
      options: { debug: true },
      connection: {
        secure: true,
        reconnect: true,
      },
      identity: {
        username: 'justinfan123', // Anonymous user
        password: `oauth:${token}`,
      },
      channels: [channel],
    });

    this.twitchClient.connect();

    this.twitchClient.on('message', (channel, tags, message, self) => {
      if (self) return;

      const chatMessage = {
        platform: 'Twitch',
        sender: tags['display-name'] || 'anonymous',
        message,
        timestamp: new Date(),
      };

      if (this.onMessageCallback) {
        this.onMessageCallback(chatMessage);
      }
    });

    this.twitchConnected = true;
  }

  async connectKick(channelName) {
    console.log(`Fetching chatroom ID for Kick channel: ${channelName}`);
    try {
      const response = await fetch(`https://kick.com/api/v2/channels/${channelName}/chatroom`);
      const data = await response.json();
      const chatroomId = data?.id;

      if (!chatroomId) {
        console.error(`Could not find chatroom for Kick channel: ${channelName}`);
        return;
      }

      const socket = io("wss://ws-us-1.pusher.com/app/2565cf7f22673273de57", {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Connected to Kick chat");

        socket.emit("join", {
          room: `chatroom:${chatroomId}`,
        });
      });

      socket.on('message', (data) => {
        const messageData = JSON.parse(data);
        const chatMessage = {
          platform: 'Kick',
          sender: messageData.sender.username,
          message: messageData.content,
          timestamp: new Date(messageData.created_at),
        };

        if (this.onMessageCallback) {
          this.onMessageCallback(chatMessage);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from Kick chat");
      });

      this.kickConnected = true;

    } catch (error) {
      console.error('Error connecting to Kick:', error);
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  async getStreamInfo() {
    // TODO: Implement logic to get stream info from the primary platform (e.g., Twitch)
    // This will require an authenticated API call.
    console.log('Fetching stream info...');
    return {
      title: 'My Awesome Stream',
      game: 'Software Development',
      tags: ['coding', 'typescript', 'nextjs'],
    };
  }

  async updateStreamInfo(info, accessToken, broadcasterId) {
    console.log('Updating stream info for broadcaster:', broadcasterId);
    
    if (this.twitchConnected) {
      try {
        const response = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`, {
          method: 'PATCH',
          headers: {
            'Client-ID': env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: info.title,
            game_id: '509658', // "Software & Game Development"
            tags: info.tags,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error updating Twitch stream info:', response.status, errorData);
        } else {
          console.log('Successfully updated Twitch stream info.');
        }
      } catch (error) {
        console.error('Error sending request to Twitch API:', error);
      }
    }
    if (this.youtubeConnected) {
      console.log('Updating YouTube stream info...');
    }
    if (this.kickConnected) {
      console.log('Updating Kick stream info...');
    }
  }
}

const streamManager = new StreamManager();
module.exports = { streamManager }; 