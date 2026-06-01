const { WebSocketServer } = require("ws");
const { streamManager } = require("../../src/lib/stream-manager");

function initializeWebSocket() {
  const wss = new WebSocketServer({ port: 3001 });

  wss.on("connection", async (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const channel = url.searchParams.get("channel");

    if (!channel) {
      console.log("Connection attempt without channel, closing.");
      ws.close();
      return;
    }

    console.log(`Client connected for channel: ${channel}`);
    ws.channel = channel; // Attach channel to the ws connection for later

    // Connect to this channel if it's the first client for it
    if (![...wss.clients].some((c) => c !== ws && c.channel === channel)) {
      console.log(`First client for ${channel}, connecting to streams...`);

      // Fetch the session to get access tokens
      try {
        const sessionRes = await fetch("http://localhost:3000/api/get-session");
        const session = await sessionRes.json();

        if (session?.twitchAccessToken) {
          streamManager.connectTwitch(channel, session.twitchAccessToken);
        }
        if (session?.googleAccessToken) {
          streamManager.connectYouTube(channel, session.googleAccessToken);
        }
        
        if (!session?.twitchAccessToken && !session?.googleAccessToken) {
          console.log("No active session found, cannot connect to streams.");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
      
      streamManager.connectKick(channel);
    }

    ws.on("close", () => {
      console.log(`Client for ${channel} disconnected`);
      // Disconnect from the stream if this was the last client for that channel
      if (![...wss.clients].some((c) => c.channel === channel)) {
        console.log(`Last client for ${channel} disconnected, closing streams.`);
        streamManager.disconnectTwitch(channel);
        streamManager.disconnectKick(channel);
        streamManager.disconnectYouTube(channel);
      }
    });
  });

  streamManager.onMessage((message) => {
    wss.clients.forEach((client) => {
      // Only send message to clients for the correct channel
      if (client.readyState === 1 && client.channel === message.channel) {
        client.send(JSON.stringify(message));
      }
    });
  });
}

module.exports = { initializeWebSocket }; 