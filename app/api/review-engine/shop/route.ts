import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getShopByOwner, upsertShop, updateProgress } from '@/lib/review-engine';

function errorMessage() {
  return 'Something went wrong. Please try again.';
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toCount(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.floor(num);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }
    const shop = await getShopByOwner(userId);
    return NextResponse.json({ shop });
  } catch (error) {
    console.error('Review Engine shop fetch error:', error);
    return NextResponse.json({ error: errorMessage() }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const existing = await getShopByOwner(userId);

    // A progress only update for the guarantee tracker: the dashboard
    // sends just the new current review count for an existing shop.
    const hasShopFields =
      body.businessName !== undefined || body.googleReviewUrl !== undefined;
    if (existing && !hasShopFields && body.currentReviewCount !== undefined) {
      const current = toCount(body.currentReviewCount);
      if (current === null) {
        return NextResponse.json(
          { error: 'Please enter a valid review count.' },
          { status: 400 }
        );
      }
      const shop = await updateProgress(existing.id, current);
      return NextResponse.json({ shop });
    }

    const businessName = clean(body.businessName) || existing?.business_name || '';
    const googleReviewUrl =
      clean(body.googleReviewUrl) || existing?.google_review_url || '';

    if (!businessName) {
      return NextResponse.json(
        { error: 'Please add your business name.' },
        { status: 400 }
      );
    }
    if (!googleReviewUrl || !isHttpUrl(googleReviewUrl)) {
      return NextResponse.json(
        { error: 'Please paste a valid Google review link that starts with http or https.' },
        { status: 400 }
      );
    }

    const baseline = toCount(body.baselineReviewCount);
    const current = toCount(body.currentReviewCount);

    const shop = await upsertShop(userId, {
      businessName,
      ownerName: clean(body.ownerName) || existing?.owner_name || null,
      ownerEmail: clean(body.ownerEmail) || existing?.owner_email || null,
      ownerPhone: clean(body.ownerPhone) || existing?.owner_phone || null,
      googleReviewUrl,
      serviceTypes: clean(body.serviceTypes) || existing?.service_types || null,
      baselineReviewCount: baseline ?? existing?.baseline_review_count ?? 0,
      currentReviewCount:
        current ??
        existing?.current_review_count ??
        baseline ??
        0,
    });

    return NextResponse.json({ shop });
  } catch (error) {
    console.error('Review Engine shop save error:', error);
    return NextResponse.json({ error: errorMessage() }, { status: 500 });
  }
}
