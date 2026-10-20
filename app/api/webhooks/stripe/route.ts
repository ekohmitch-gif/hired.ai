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
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription;

    if (userId) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          isPro: true,
          credits: 999,
          stripeSubscriptionId: subscriptionId,
        },
      });
    }
  }

  if (
    event.type === 'customer.subscription.deleted' ||
    event.type === 'customer.subscription.updated'
  ) {
    const subscription = event.data.object as any;
    const isActive = subscription.status === 'active' || subscription.status === 'trialing';

    // Find the subscriber by their stored subscription ID. Page through
    // ALL Clerk users — stopping at the first 500 meant cancellations
    // from later subscribers were silently never honored.
    const PAGE_SIZE = 500;
    let match: any = undefined;
    for (let offset = 0; match === undefined; offset += PAGE_SIZE) {
      const page = await clerkClient.users.getUserList({ limit: PAGE_SIZE, offset });
      match = page.data.find(
        (u: any) => u.publicMetadata?.stripeSubscriptionId === subscription.id
      );
      if (page.data.length < PAGE_SIZE) break;
    }

    if (match) {
      await clerkClient.users.updateUserMetadata(match.id, {
        publicMetadata: {
          ...match.publicMetadata,
          isPro: isActive,
          ...(isActive
            ? {}
            : { credits: 3, creditsResetAt: new Date().toISOString() }),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}