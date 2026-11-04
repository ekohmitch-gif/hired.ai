import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, listFeedback } from '@/lib/review-engine';

// The private feedback inbox list for the signed in owner. Creating
// feedback happens on the public customer endpoint, not here.
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }
    const shop = await getShopByOwner(userId);
    if (!shop) {
      return NextResponse.json({ feedback: [] });
    }
    const feedback = await listFeedback(shop.id);
    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Review Engine feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
