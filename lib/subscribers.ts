import crypto from 'crypto';
import { sql } from '@/lib/db';
import { SITE_URL } from '@/lib/email';

// Blog mailing list storage. The app has no migration runner, tables are
// used through the sql helper in lib/db.ts, so the subscribers table is
// created here idempotently on first use.

let tableReady: Promise<void> | null = null;

export function ensureBlogSubscribersTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS blog_subscribers (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          unsubscribed_at TIMESTAMPTZ
        )
      `;
    })();
    tableReady.catch(() => {
      tableReady = null;
    });
  }
  return tableReady;
}

// Unsubscribe links carry an HMAC of the email address, signed with the
// Clerk server secret that this app already uses (the Stripe webhook
// route reads CLERK_SECRET_KEY), so no new secret is required. A link
// can only unsubscribe the exact address it was minted for.
function unsubscribeSecret(): string {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    throw new Error('CLERK_SECRET_KEY is not set.');
  }
  return secret;
}

export function unsubscribeToken(email: string): string {
  return crypto
    .createHmac('sha256', unsubscribeSecret())
    .update(email.trim().toLowerCase())
    .digest('hex');
}

export function unsubscribeUrl(email: string): string {
  const cleaned = email.trim().toLowerCase();
  return `${SITE_URL}/api/unsubscribe?email=${encodeURIComponent(
    cleaned
  )}&token=${unsubscribeToken(cleaned)}`;
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  let expected: Buffer;
  try {
    expected = Buffer.from(unsubscribeToken(email));
  } catch {
    return false;
  }
  const provided = Buffer.from(token || '');
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}
