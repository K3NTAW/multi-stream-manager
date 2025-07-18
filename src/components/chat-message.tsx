import { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { Badge } from "./ui/badge";
import { UserProfileCard } from "./user-profile-card";

const chatColors = [
  "#FF0000",
  "#0000FF",
  "#008000",
  "#B22222",
  "#FF7F50",
  "#9ACD32",
  "#FF4500",
  "#2E8B57",
  "#DAA520",
  "#D2691E",
  "#5F9EA0",
  "#1E90FF",
  "#FF69B4",
  "#8A2BE2",
];

const userColorCache = new Map<string, string>();

function assignUserColor(username: string): string {
  if (userColorCache.has(username)) {
    return userColorCache.get(username)!;
  }
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const index = Math.abs(hash) % chatColors.length;
  const color = chatColors[index];
  userColorCache.set(username, color);
  return color;
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const getPlatformBadgeVariant = (
    platform: ChatMessageType["platform"]
  ): "twitch" | "youtube" | "kick" | "outline" => {
    switch (platform) {
      case "Twitch":
        return "twitch";
      case "YouTube":
        return "youtube";
      case "Kick":
        return "kick";
      default:
        return "outline";
    }
  };

  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const userColor = assignUserColor(message.sender);

  return (
    <div className="px-4 py-1 rounded-lg hover:bg-accent transition-colors">
      <div className="text-base leading-normal text-foreground break-words">
        <Badge
          variant={getPlatformBadgeVariant(message.platform)}
          className="mr-1.5 align-baseline"
        >
          {message.platform}
        </Badge>
        <button
          className="font-semibold hover:underline"
          style={{ color: userColor }}
          onClick={() => setIsProfileOpen(true)}
        >
          {message.sender}
        </button>
        <span>: </span>
        <span className="message-content">
          {renderMessage(message.message)}
        </span>
      </div>
      <UserProfileCard
        username={message.sender}
        platform={message.platform}
        channel={message.channel}
        isOpen={isProfileOpen}
        onOpenChange={setIsProfileOpen}
      />
    </div>
  );
} 