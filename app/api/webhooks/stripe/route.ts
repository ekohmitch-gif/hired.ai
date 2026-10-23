import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClerkClient } from '@clerk/backend';
import {
  sendTrialEndingEmail,
  sendPaymentFailedEmail,
  sendCancellationEmail,
} from '@/lib/email';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Resolve the email address for a Stripe customer reference (an id
// string, an expanded customer object, or a deleted customer). Returns
// null when no address can be found. Used only for lifecycle emails.
async function getCustomerEmail(customer: any): Promise<string | null> {
  try {
    if (!customer) return null;
    if (typeof customer === 'object') {
      return customer.email ?? null;
    }
    const retrieved: any = await stripe.customers.retrieve(customer);
    if (retrieved && !retrieved.deleted) return retrieved.email ?? null;
    return null;
  } catch (err) {
    console.error('Could not resolve Stripe customer email:', err);
    return null;
  }
}

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

  // Lifecycle emails. These blocks only read the event and send mail;
  // they do not change any existing webhook behavior above.

  if (event.type === 'customer.subscription.trial_will_end') {
    try {
      const subscription = event.data.object as any;
      const email = await getCustomerEmail(subscription.customer);
      if (email) {
        const trialEndDate = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toLocaleDateString(
              'en-US',
              {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC',
              }
            )
          : null;
        await sendTrialEndingEmail(email, trialEndDate);
      }
    } catch (err) {
      console.error('Trial ending email failed:', err);
    }
  }

  if (event.type === 'invoice.payment_failed') {
    try {
      const invoice = event.data.object as any;
      const email =
        invoice.customer_email ||
        (await getCustomerEmail(invoice.customer));
      if (email) {
        await sendPaymentFailedEmail(email);
      }
    } catch (err) {
      console.error('Payment failed email failed:', err);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    try {
      const subscription = event.data.object as any;
      const email = await getCustomerEmail(subscription.customer);
      if (email) {
        await sendCancellationEmail(email);
      }
    } catch (err) {
      console.error('Cancellation email failed:', err);
    }
  }

  return NextResponse.json({ received: true });
}