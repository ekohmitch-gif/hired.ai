import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  getShopByOwner,
  createRequest,
  updateRequestSmsStatus,
  listRequests,
} from '@/lib/review-engine';
import { sendSms } from '@/lib/sms';

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
      return NextResponse.json({ requests: [] });
    }
    const requests = await listRequests(shop.id);
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Review Engine requests fetch error:', error);
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
        { error: 'Set up your shop first, then you can send requests.' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const customerName = clean(body.customerName);
    const customerPhone = clean(body.customerPhone);
    const jobDescription = clean(body.jobDescription);

    if (!customerName) {
      return NextResponse.json(
        { error: 'Please add the customer name.' },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(16).toString('hex');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.enhancerez.com';
    const link = `${siteUrl}/r/${token}`;

    // Persist the request row before any text goes out, so a customer
    // never receives a link that points at a request that does not
    // exist. The row starts as pending and the send result is written
    // back onto it once the text has been attempted.
    const created = await createRequest(shop.id, {
      token,
      customerName,
      customerPhone: customerPhone || null,
      jobDescription: jobDescription || null,
      smsStatus: customerPhone ? 'pending' : 'no_phone',
    });

    let request = created;
    if (customerPhone) {
      const firstName = customerName.split(/\s+/)[0];
      const jobLine = jobDescription ? ` for ${jobDescription}` : '';
      const result = await sendSms(
        customerPhone,
        `Hi ${firstName}, thanks for choosing ${shop.business_name}. How did we do${jobLine}? Tell us here: ${link}`
      );
      const smsStatus = result.sent ? 'sent' : result.reason || 'send_failed';
      const updated = await updateRequestSmsStatus(created.id, smsStatus);
      if (updated) request = updated;
    }

    return NextResponse.json({ request: { ...request, link } });
  } catch (error) {
    console.error('Review Engine request create error:', error);
    return NextResponse.json({ error: errorMessage() }, { status: 500 });
  }
}
