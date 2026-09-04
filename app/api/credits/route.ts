import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { computeCreditState } from '@/lib/credits';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const { state, changed } = computeCreditState(user);

    if (changed) {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { ...user.publicMetadata, ...state },
      });
    }

    return NextResponse.json(state);
  } catch (error: any) {
    console.error('Credits fetch error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load credits' }, { status: 500 });
  }
}