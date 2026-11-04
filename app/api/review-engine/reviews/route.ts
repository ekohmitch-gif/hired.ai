import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, addReview, listReviews } from '@/lib/review-engine';

function errorMessage() {
  return 'Something went wrong. Please try again.';
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }
    const shop = await getShopByOwner(userId);
    if (!shop) {
      return NextResponse.json({ reviews: [] });
    }
    const reviews = await listReviews(shop.id);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Review Engine reviews fetch error:', error);
    return NextResponse.json({ error: errorMessage() }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }
    const shop = await getShopByOwner(userId);
    if (!shop) {
      return NextResponse.json(
        { error: 'Set up your shop first, then you can add reviews.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reviewText = clean(body.reviewText);
    if (!reviewText) {
      return NextResponse.json(
        { error: 'Please paste the review text.' },
        { status: 400 }
      );
    }

    let rating: number | null = null;
    if (body.rating !== undefined && body.rating !== null && body.rating !== '') {
      const parsed = Number(body.rating);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
        return NextResponse.json(
          { error: 'Rating must be a whole number from 1 to 5.' },
          { status: 400 }
        );
      }
      rating = parsed;
    }

    const reviewDate = clean(body.reviewDate);
    const review = await addReview({
      shopId: shop.id,
      reviewerName: clean(body.reviewerName) || null,
      rating,
      reviewText,
      jobDescription: clean(body.jobDescription) || null,
      reviewDate: reviewDate || null,
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Review Engine review add error:', error);
    return NextResponse.json({ error: errorMessage() }, { status: 500 });
  }
}
