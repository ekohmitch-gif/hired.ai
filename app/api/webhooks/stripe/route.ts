import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      // Grant unlimited credits or set tier to Pro in user metadata
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
          credits: 999,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
