import { NextResponse } from 'next/server';
import { isRateLimited } from '@/lib/rate-limit';
import {
  getRequestByToken,
  markRequestStatus,
  addFeedback,
} from '@/lib/review-engine';
import { sendFeedbackAlertEmail } from '@/lib/review-email';

// Public customer endpoint. It only ever returns public fields: the
// business name, the job line, and the request status. Owner details
// and phone numbers never leave the server through this route, apart
// from the shop Google review link, which is shared only after the
// customer says the job went well so they can act on it.

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    if (isRateLimited(req, 're-public', 60, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    const { token } = await params;
    const request = await getRequestByToken(token);
    if (!request) {
      return NextResponse.json({ error: 'This link was not found.' }, { status: 404 });
    }
    return NextResponse.json({
      businessName: request.business_name,
      jobDescription: request.job_description,
      status: request.status,
    });
  } catch (error) {
    console.error('Review Engine public fetch error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    if (isRateLimited(req, 're-public', 60, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      );
    }
    const { token } = await params;
    const request = await getRequestByToken(token);
    if (!request) {
      return NextResponse.json({ error: 'This link was not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));

    if (body?.action === 'happy') {
      if (request.status === 'sent') {
        await markRequestStatus(token, 'happy');
      }
      return NextResponse.json({
        status: 'happy',
        googleReviewUrl: request.google_review_url,
      });
    }

    if (body?.action === 'feedback') {
      const message = typeof body.message === 'string' ? body.message.trim() : '';
      if (!message) {
        return NextResponse.json(
          { error: 'Please tell the shop what could have been better.' },
          { status: 400 }
        );
      }
      if (message.length > 4000) {
        return NextResponse.json(
          { error: 'That message is a little long. Please shorten it and try again.' },
          { status: 413 }
        );
      }
      const name =
        typeof body.name === 'string' && body.name.trim()
          ? body.name.trim()
          : request.customer_name;

      if (request.status === 'sent') {
        await addFeedback({
          shopId: request.shop_id,
          requestId: request.id,
          customerName: name,
          message,
        });
        await markRequestStatus(token, 'feedback');

        // Fire the owner alert without letting email hold up or break
        // the customer response. sendEmail never throws, and the extra
        // catch keeps that guarantee even if this wrapper changes.
        void sendFeedbackAlertEmail({
          ownerEmail: request.owner_email,
          ownerName: request.owner_name,
          businessName: request.business_name,
          customerName: name,
          message,
          jobDescription: request.job_description,
        }).catch(() => undefined);
      }

      return NextResponse.json({ status: 'feedback' });
    }

    return NextResponse.json(
      { error: 'Please choose one of the two options.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Review Engine public action error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
