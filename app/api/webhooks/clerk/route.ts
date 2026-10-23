import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { sendWelcomeEmail } from '@/lib/email';

// Clerk webhook endpoint. Verifies the svix signature headers against
// CLERK_WEBHOOK_SECRET and sends the welcome email on user.created.
// Configure in the Clerk dashboard with the endpoint URL
// https://www.enhancerez.com/api/webhooks/clerk subscribed to
// user.created, then put the signing secret in the Vercel env vars.
export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error(
      'Clerk webhook called but CLERK_WEBHOOK_SECRET is not set.'
    );
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 500 }
    );
  }

  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing webhook headers' },
      { status: 400 }
    );
  }

  const payload = await req.text();

  let event: any;
  try {
    event = new Webhook(secret).verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Clerk webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'user.created') {
    const data = event.data || {};
    const addresses: any[] = Array.isArray(data.email_addresses)
      ? data.email_addresses
      : [];
    const primary =
      addresses.find((a) => a.id === data.primary_email_address_id) ||
      addresses[0];
    const email = primary?.email_address;

    if (email) {
      const firstName =
        typeof data.first_name === 'string' && data.first_name
          ? data.first_name
          : undefined;
      // sendWelcomeEmail never throws, so a mail problem cannot fail
      // the webhook response.
      await sendWelcomeEmail(email, firstName);
    } else {
      console.error('Clerk user.created event carried no email address.');
    }
  }

  return NextResponse.json({ received: true });
}
