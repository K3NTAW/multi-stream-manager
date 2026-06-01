const tmi = require('tmi.js');
const { io } = require('socket.io-client');
const { google } = require('googleapis');
const { env } = require('../../src/lib/env');

class StreamManager {
  twitchClients = {}; // Key: channel, Value: tmi.Client
  kickSockets = {}; // Key: channel, Value: socket
  youtubeIntervals = {}; // Key: channel, Value: interval ID
  onMessageCallback = null;

  constructor() {
    // Public constructor
  }

  connectTwitch(channel, token) {
    if (this.twitchClients[channel]) {
      console.log(`Already connected to Twitch channel: ${channel}`);
      return;
    }

    console.log(`Connecting to Twitch channel: ${channel}`);

    const twitchClient = new tmi.Client({
      options: { debug: false },
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

    twitchClient.connect().catch(console.error);

    twitchClient.on('message', (ch, tags, message, self) => {
      if (self) return;

      const chatMessage = {
        platform: 'Twitch',
        channel: ch.replace('#', ''),
        sender: tags['display-name'] || 'anonymous',
        message,
        timestamp: new Date(),
      };

      if (this.onMessageCallback) {
        this.onMessageCallback(chatMessage);
      }
    });

    this.twitchClients[channel] = twitchClient;
  }

  disconnectTwitch(channel) {
    if (this.twitchClients[channel]) {
      console.log(`Disconnecting from Twitch channel: ${channel}`);
      this.twitchClients[channel].disconnect();
      delete this.twitchClients[channel];
    }
  }

  async connectKick(channel) {
    if (this.kickSockets[channel]) {
      console.log(`Already connected to Kick channel: ${channel}`);
      return;
    }
    console.log(`Fetching chatroom ID for Kick channel: ${channel}`);
    try {
      const response = await fetch(`https://kick.com/api/v2/channels/${channel}/chatroom`);
      const data = await response.json();
      const chatroomId = data?.id;

      if (!chatroomId) {
        console.error(`Could not find chatroom for Kick channel: ${channel}`);
        return;
      }

      const socket = io("wss://ws-us-1.pusher.com/app/2565cf7f22673273de57", {
        transports: ["websocket"],
      });

      socket.on('connect', () => {
        console.log(`Connected to Kick chat for ${channel}`);
        socket.emit('join', {
          room: `chatroom:${chatroomId}`,
        });
      });

      socket.on('message', (data) => {
        const messageData = JSON.parse(data);
        const chatMessage = {
          platform: 'Kick',
          channel: channel,
          sender: messageData.sender.username,
          message: messageData.content,
          timestamp: new Date(messageData.created_at),
        };

        if (this.onMessageCallback) {
          this.onMessageCallback(chatMessage);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Disconnected from Kick chat for ${channel}`);
      });

      this.kickSockets[channel] = socket;
    } catch (error) {
      console.error('Error connecting to Kick:', error);
    }
  }

  disconnectKick(channel) {
    if (this.kickSockets[channel]) {
      console.log(`Disconnecting from Kick channel: ${channel}`);
      this.kickSockets[channel].disconnect();
      delete this.kickSockets[channel];
    }
  }

  async connectYouTube(channel, accessToken) {
    if (this.youtubeIntervals[channel]) {
      console.log(`Already polling YouTube chat for: ${channel}`);
      return;
    }

    console.log(`Starting YouTube chat polling for: ${channel}`);
    console.log(`Using YouTube access token: ${accessToken ? 'Exists' : 'Does not exist'}`);


    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      // 1. Get the user's active live stream to find the liveChatId
      const videoResponse = await youtube.liveBroadcasts.list({
        part: 'snippet',
        broadcastStatus: 'active',
        mine: true,
      });

      console.log('YouTube API response for live broadcasts:', JSON.stringify(videoResponse.data, null, 2));


      const liveBroadcast = videoResponse.data.items?.[0];
      if (!liveBroadcast || !liveBroadcast.snippet?.liveChatId) {
        console.log(`No active YouTube stream found for ${channel}.`);
        return;
      }
      const liveChatId = liveBroadcast.snippet.liveChatId;
      console.log(`Found live chat ID: ${liveChatId}`);

      // 2. Poll for new messages
      let nextPageToken = undefined;
      this.youtubeIntervals[channel] = setInterval(async () => {
        try {
          const chatResponse = await youtube.liveChatMessages.list({
            liveChatId,
            part: 'snippet,authorDetails',
            pageToken: nextPageToken,
          });

          console.log(`YouTube chat response for ${liveChatId}:`, JSON.stringify(chatResponse.data, null, 2));


          const newMessages = chatResponse.data.items || [];
          for (const item of newMessages) {
            const chatMessage = {
              platform: 'YouTube',
              channel: channel,
              sender: item.authorDetails?.displayName || 'anonymous',
              message: item.snippet?.displayMessage || '',
              timestamp: new Date(item.snippet?.publishedAt || Date.now()),
            };
            if (this.onMessageCallback) {
              this.onMessageCallback(chatMessage);
            }
          }

          nextPageToken = chatResponse.data.nextPageToken;
        } catch (error) {
          console.error('Error polling YouTube chat:', error.message);
          this.disconnectYouTube(channel);
        }
      }, 5000); // Poll every 5 seconds
    } catch (error) {
      console.error('Error connecting to YouTube:', error.message);
    }
  }

  disconnectYouTube(channel) {
    if (this.youtubeIntervals[channel]) {
      console.log(`Stopping YouTube chat polling for: ${channel}`);
      clearInterval(this.youtubeIntervals[channel]);
      delete this.youtubeIntervals[channel];
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