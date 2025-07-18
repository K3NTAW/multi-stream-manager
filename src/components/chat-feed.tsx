'use client';

import { useEffect, useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ChatFeed() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Unified Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="text-sm">
              <span
                className={`font-bold ${
                  msg.platform === 'Twitch'
                    ? 'text-purple-400'
                    : msg.platform === 'YouTube'
                    ? 'text-red-400'
                    : 'text-green-400'
                }`}
              >
                [{msg.platform}]
              </span>{' '}
              <span className="font-semibold">{msg.sender}:</span> {msg.message}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 