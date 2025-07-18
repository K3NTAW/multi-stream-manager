import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "./ui/button";

interface UserProfileCardProps {
  username: string;
  platform: string;
  channel: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserData {
  avatarUrl: string;
  bannerUrl: string;
  followingSince: string | null;
  subscribedSince: string | null;
  isModerator: boolean;
  chatHistory: string[];
}

export function UserProfileCard({
  username,
  platform,
  channel,
  isOpen,
  onOpenChange,
}: UserProfileCardProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && platform === "Twitch") {
      setIsLoading(true);
      setError(null);
      fetch(`/api/user/twitch/${username}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((data) => {
          setUserData(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [isOpen, username, platform]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg">
        {isLoading && <div className="p-6">Loading...</div>}
        {error && <div className="p-6 text-red-500">{error}</div>}
        {userData && !isLoading && (
          <>
            <div className="relative">
              <img
                src={userData.bannerUrl}
                alt={`${username}'s banner`}
                className="w-full h-32 object-cover rounded-t-lg"
              />
              <Avatar className="absolute -bottom-10 left-6 w-20 h-20 border-4 border-background">
                <AvatarImage src={userData.avatarUrl} alt={username} />
                <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
              </Avatar>
            </div>
            <DialogHeader className="px-6 pt-12">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                {username}
                {userData.isModerator && <Badge>Moderator</Badge>}
                <Badge variant="outline">{platform}</Badge>
              </DialogTitle>
              <DialogDescription>
                {userData.followingSince
                  ? `Following since ${new Date(
                      userData.followingSince
                    ).toLocaleDateString()}`
                  : "Not following"}
                {userData.subscribedSince && " · Subscribed"}
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 pb-6 space-y-4">
              <Button asChild className="w-full">
                <a
                  href={`https://twitch.tv/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>
              </Button>
              {platform === "Twitch" && (
                <Button asChild className="w-full" variant="secondary">
                  <a
                    href={`https://www.twitch.tv/popout/${channel}/viewercard/${username.toLowerCase()}?popout=`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Viewer Card
                  </a>
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 