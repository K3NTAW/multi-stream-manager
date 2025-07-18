import { NextResponse } from 'next/server';
import { streamManager } from '@/lib/stream-manager';
import { StreamInfo } from '@/lib/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
  const info = await streamManager.getStreamInfo();
  return NextResponse.json(info);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const info: StreamInfo = await request.json();
  await streamManager.updateStreamInfo(info, session.accessToken, session.user.id);
  return NextResponse.json({ success: true });
} 