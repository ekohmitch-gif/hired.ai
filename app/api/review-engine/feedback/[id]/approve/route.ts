import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, getFeedbackById, approveItem } from '@/lib/review-engine';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }
    const shop = await getShopByOwner(userId);
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });
    }
    const { id } = await params;
    const feedback = await getFeedbackById(id, shop.id);
    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const provided =
      typeof body?.approvedReply === 'string'
        ? body.approvedReply.trim()
        : typeof body?.text === 'string'
          ? body.text.trim()
          : '';
    const approvedReply = provided || feedback.draft_reply || '';
    if (!approvedReply) {
      return NextResponse.json(
        { error: 'Draft a reply first, or write one, then approve it.' },
        { status: 400 }
      );
    }

    const updated = await approveItem('feedback', id, shop.id, approvedReply);
    return NextResponse.json({ feedback: updated });
  } catch (error) {
    console.error('Review Engine feedback approve error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
