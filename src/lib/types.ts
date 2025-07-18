export interface ChatMessage {
  platform: 'Twitch' | 'YouTube' | 'Kick';
  channel: string;
  sender: string;
  message: string;
  timestamp: Date;
}

export interface StreamInfo {
  title: string;
  game: string;
  tags: string[];
} 