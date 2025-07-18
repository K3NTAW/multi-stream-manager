import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { env } from "@/lib/env";

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  offline_image_url: string;
  created_at: string;
}

interface TwitchFollower {
  followed_at: string;
}

interface TwitchSubscription {
  tier: string;
}

async function getTwitchUser(
  username: string,
  accessToken: string
): Promise<TwitchUser | null> {
  const res = await fetch(
    `https://api.twitch.tv/helix/users?login=${username}`,
    {
      headers: {
        "Client-ID": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    return null;
  }

  const { data } = await res.json();
  return data[0] || null;
}

async function getFollowerSince(
  userId: string,
  broadcasterId: string,
  accessToken: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&user_id=${userId}`,
    {
      headers: {
        "Client-ID": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    return null;
  }
  const { data } = (await res.json()) as { data: TwitchFollower[] };
  return data[0]?.followed_at || null;
}

async function getSubscription(
  userId: string,
  broadcasterId: string,
  accessToken: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.twitch.tv/helix/subscriptions?user_id=${userId}&broadcaster_id=${broadcasterId}`,
    {
      headers: {
        "Client-ID": env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) return null;
  const { data } = (await res.json()) as { data: TwitchSubscription[] };
  return data.length > 0 ? "Subscribed" : null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken || !session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = params;
  const accessToken = session.accessToken as string;
  const broadcasterId = session.user.id;

  try {
    const user = await getTwitchUser(username, accessToken);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [followingSince, subscription] = await Promise.all([
      getFollowerSince(user.id, broadcasterId, accessToken),
      getSubscription(user.id, broadcasterId, accessToken),
    ]);

    // Note: Fetching full chat history is complex and often requires a dedicated service.
    // For this example, we'll return a placeholder.
    const chatHistory = [
      "This is a real message from the user's history (placeholder).",
      "Another message from the user (placeholder).",
    ];

    const bannerUrl = `https://placehold.co/600x200/27272a/94a3b8/png?text=${user.display_name}`;

    return NextResponse.json({
      avatarUrl: user.profile_image_url,
      bannerUrl: user.offline_image_url || bannerUrl,
      followingSince,
      subscribedSince: subscription,
      isModerator: false, // This would require another API call or a different approach
      chatHistory,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 