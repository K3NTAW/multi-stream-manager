const { WebSocketServer } = require('ws');
const { streamManager } = require('../../src/lib/stream-manager');

function initializeWebSocket() {
  const wss = new WebSocketServer({ port: 3001 });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket server');
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  streamManager.onMessage((message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify(message));
      }
    });
  });

  // For now, let's auto-connect to some test channels.
  // In a real app, this would be driven by user accounts and database state.
  streamManager.connectTwitch('xqc', 'any-oauth-token');
  streamManager.connectKick('xqc');
}

module.exports = { initializeWebSocket }; 