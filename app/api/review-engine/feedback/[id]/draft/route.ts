import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, getFeedbackById, setDraft } from '@/lib/review-engine';
import { draftReply } from '@/lib/review-ai';

export async function POST(
  _req: Request,
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

    const draft = await draftReply({
      kind: 'feedback',
      businessName: shop.business_name,
      reviewerName: feedback.customer_name,
      text: feedback.message,
    });
    if (!draft) {
      return NextResponse.json(
        { error: 'Drafting is unavailable right now. Please try again in a little while.' },
        { status: 502 }
      );
    }

    const updated = await setDraft('feedback', id, shop.id, draft);
    return NextResponse.json({ feedback: updated });
  } catch (error) {
    console.error('Review Engine feedback draft error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
