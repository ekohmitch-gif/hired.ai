import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { isRateLimited } from '@/lib/rate-limit';
import {
  ensureBlogSubscribersTable,
  unsubscribeUrl,
} from '@/lib/subscribers';
import { sendBlogConfirmationEmail } from '@/lib/email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST: subscribe an email address to the blog mailing list. Stores the
// address once (repeat subscribes succeed without a duplicate row and
// clear a previous unsubscribe), then sends a confirmation email that
// carries the unsubscribe link. A failed confirmation send never fails
// the subscription itself.
export async function POST(req: Request) {
  try {
    if (isRateLimited(req, 'subscribe', 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    const cleaned =
      typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleaned || cleaned.length > 254 || !EMAIL_PATTERN.test(cleaned)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await ensureBlogSubscribersTable();

    await sql`
      INSERT INTO blog_subscribers (email)
      VALUES (${cleaned})
      ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL
    `;

    await sendBlogConfirmationEmail(cleaned, unsubscribeUrl(cleaned));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blog subscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
