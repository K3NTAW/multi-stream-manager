'use client';

import { useEffect, useState } from 'react';
import { StreamInfo } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function StreamInfoForm() {
  const [streamInfo, setStreamInfo] = useState<StreamInfo | null>(null);

  useEffect(() => {
    fetch('/api/stream-info')
      .then((res) => res.json())
      .then(setStreamInfo);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (streamInfo) {
      await fetch('/api/stream-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(streamInfo),
      });
      toast.success('Stream info updated!');
    }
  };

  if (!streamInfo) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={streamInfo.title}
          onChange={(e) =>
            setStreamInfo({ ...streamInfo, title: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="game">Game</Label>
        <Input
          id="game"
          value={streamInfo.game}
          onChange={(e) =>
            setStreamInfo({ ...streamInfo, game: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={streamInfo.tags.join(', ')}
          onChange={(e) =>
            setStreamInfo({
              ...streamInfo,
              tags: e.target.value.split(',').map((t) => t.trim()),
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          Separate tags with a comma.
        </p>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
} 