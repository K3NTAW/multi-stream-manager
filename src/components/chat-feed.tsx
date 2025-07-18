'use client';

import { useEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { Button } from './ui/button';
import { ExternalLink, Wifi, WifiOff, Trash2 } from 'lucide-react';

const MAX_MESSAGES = 1000;

export function ChatFeed() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => 24,
    overscan: 10,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  const connect = () => {
    ws.current = new WebSocket('ws://localhost:3001');

    ws.current.onopen = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, message].slice(-MAX_MESSAGES);
        localStorage.setItem('chat_messages', JSON.stringify(newMessages));
        return newMessages;
      });
    };

    ws.current.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem('chat_messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
    connect();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'chat_messages') {
        if (event.newValue) {
          setMessages(JSON.parse(event.newValue));
        } else {
          setMessages([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      disconnect();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const { scrollHeight, clientHeight, scrollTop } = scrollAreaRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 200;
      if (isAtBottom) {
        rowVirtualizer.scrollToIndex(messages.length - 1, {
          align: 'end',
          behavior: 'smooth',
        });
      }
    }
  }, [messages, rowVirtualizer]);

  const handleSend = (message: string) => {
    console.log('Sending message:', message);
    // TODO: Implement sending message to the correct platform
  };

  const handlePopOut = () => {
    window.open('/chat', 'Chat', 'width=400,height=600');
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('chat_messages');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Unified Chat</CardTitle>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Button variant="ghost" size="icon" onClick={disconnect}>
              <WifiOff className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={connect}>
              <Wifi className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handlePopOut}>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClearChat}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden min-h-0">
        <div className="flex-grow overflow-y-auto" ref={scrollAreaRef}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ChatMessage message={messages[virtualItem.index]} />
              </div>
            ))}
          </div>
        </div>
        <ChatInput onSend={handleSend} />
      </CardContent>
    </Card>
  );
} 