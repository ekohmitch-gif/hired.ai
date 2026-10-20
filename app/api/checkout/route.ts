import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Server-side guard: never create a second subscription for an
    // already-Pro user. The client hides the checkout button for
    // subscribers, but the route cannot trust that — a direct call
    // would otherwise double-subscribe them (review N4).
    if (user.publicMetadata?.isPro === true) {
      return NextResponse.json(
        { error: "You're already subscribed to Pro — there's no need to check out again." },
        { status: 409 }
      );
    }

    const email = user.emailAddresses[0]?.emailAddress;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // The UI promises "7 days free" — grant the trial the button
      // advertises (owner decision, Oct 19, 2026).
      subscription_data: {
        trial_period_days: 7,
      },
      customer_email: email,
      metadata: {
        userId: userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Something went wrong — please try again' }, { status: 500 });
  }
}
