const { WebSocketServer } = require("ws");
const { streamManager } = require("../../src/lib/stream-manager");

function initializeWebSocket() {
  const wss = new WebSocketServer({ port: 3001 });

  wss.on("connection", (ws, req) => {
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
      streamManager.connectTwitch(channel, "any-oauth-token");
      streamManager.connectKick(channel);
    }

    ws.on("close", () => {
      console.log(`Client for ${channel} disconnected`);
      // Disconnect from the stream if this was the last client for that channel
      if (![...wss.clients].some((c) => c.channel === channel)) {
        console.log(`Last client for ${channel} disconnected, closing streams.`);
        streamManager.disconnectTwitch(channel);
        streamManager.disconnectKick(channel);
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