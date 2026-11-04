import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, getReviewById, setDraft } from '@/lib/review-engine';
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
    const review = await getReviewById(id, shop.id);
    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    const draft = await draftReply({
      kind: 'review',
      businessName: shop.business_name,
      reviewerName: review.reviewer_name,
      rating: review.rating,
      text: review.review_text || '',
      jobDescription: review.job_description,
    });
    if (!draft) {
      return NextResponse.json(
        { error: 'Drafting is unavailable right now. Please try again in a little while.' },
        { status: 502 }
      );
    }

    const updated = await setDraft('review', id, shop.id, draft);
    return NextResponse.json({ review: updated });
  } catch (error) {
    console.error('Review Engine review draft error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
