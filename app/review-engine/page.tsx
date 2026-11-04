import Link from 'next/link';

const FOUNDING_CHECKOUT_URL = 'https://buy.stripe.com/3cI9AS3aZ7q95we53qaMU00';

const labelClass =
  'text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500';
const panelClass = 'rounded-3xl border border-[#E5DCCB] bg-[#F2EBDF] p-6 sm:p-8';
const primaryButtonClass =
  'inline-block rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-black';
const secondaryButtonClass =
  'inline-block rounded-full border border-stone-900 px-7 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-[#F2EBDF]';

const steps = [
  {
    title: 'Text after the job',
    body: 'When the work is done, your customer gets one short text asking how it went. No app to install and nothing for your team to learn.',
  },
  {
    title: 'Happy customers go to Google',
    body: 'Customers who had a great experience go straight to your Google review page, while the visit is still fresh in their mind.',
  },
  {
    title: 'Unhappy customers come to you first',
    body: 'Customers who had a problem send private feedback to you instead of posting it in public, so you can make it right. Every Google review also gets a reply drafted about the actual job, and you approve it with one tap before anything is used.',
  },
];

export default function ReviewEngineLanding() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DCCB] pb-5">
        <p className="text-lg font-semibold text-stone-900">Review Engine</p>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/review-demo.html" className="rounded-full px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-[#F2EBDF]">
            One minute demo
          </a>
          <Link href="/review-engine/dashboard" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
            Owner dashboard
          </Link>
        </div>
      </header>

      <section className="space-y-6 py-12 sm:py-16">
        <p className={labelClass}>For local shops</p>
        <h1 className="max-w-3xl text-4xl leading-[1.08] font-medium text-stone-900 sm:text-6xl">
          Your happiest customers are quiet. Review Engine gives them a reason to speak up on Google.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-stone-500 sm:text-lg">
          Most people only leave a review when something goes wrong. Review Engine asks every customer, right after the job, and routes each answer the right way, so your Google page starts to sound like the work you actually do.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={FOUNDING_CHECKOUT_URL} className={primaryButtonClass}>
            Become a founding shop
          </a>
          <Link href="/review-engine/dashboard" className={secondaryButtonClass}>
            Sign in and set up your shop
          </Link>
        </div>
        <p className="text-sm text-stone-500">
          Prefer to look first? Watch the{' '}
          <a href="/review-demo.html" className="font-medium text-stone-900 underline underline-offset-4">
            one minute demo
          </a>
          .
        </p>
      </section>

      <section className="space-y-6 border-t border-[#E5DCCB] py-12">
        <p className={labelClass}>How it works</p>
        <h2 className="text-3xl font-medium text-stone-900 sm:text-4xl">Three steps, and most of it runs itself</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-3xl border border-[#E5DCCB] bg-white p-6">
              <p className="text-sm font-semibold text-stone-500">Step {index + 1}</p>
              <h3 className="pt-2 text-xl font-medium text-stone-900">{step.title}</h3>
              <p className="pt-3 text-sm leading-relaxed text-stone-500">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
        <div className={panelClass}>
          <p className={labelClass}>The guarantee</p>
          <h2 className="pt-3 text-3xl font-medium text-stone-900">30 more Google reviews in 60 days, or you do not pay</h2>
          <p className="pt-4 text-sm leading-relaxed text-stone-500">
            We count from the review total on your Google listing on the day you start. If your listing has not gained 30 reviews at the end of 60 days, you do not pay. Your dashboard shows the count, the progress, and the days left, so you can check the promise any time.
          </p>
        </div>
        <div className={panelClass}>
          <p className={labelClass}>The price</p>
          <h2 className="pt-3 text-3xl font-medium text-stone-900">$49 a month, flat, per location</h2>
          <p className="pt-4 text-sm leading-relaxed text-stone-500">
            One price covers the texts, the routing, and the reply drafts for one location. The big review platforms charge around $300 a month per location for tools like this. Founding shops lock in the $49 price by starting now.
          </p>
          <div className="pt-6">
            <a href={FOUNDING_CHECKOUT_URL} className={primaryButtonClass}>
              Start as a founding shop
            </a>
          </div>
        </div>
      </section>

      <section className="space-y-5 border-t border-[#E5DCCB] py-12 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-medium text-stone-900 sm:text-4xl">
          Set up takes a few minutes, and the first text can go out today
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-stone-500">
          Add your business name, paste your Google review link, and tell us your review count today for the guarantee baseline. That is the whole setup.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/review-engine/dashboard" className={primaryButtonClass}>
            Sign in and set up your shop
          </Link>
          <a href={FOUNDING_CHECKOUT_URL} className={secondaryButtonClass}>
            Founding checkout
          </a>
        </div>
      </section>

      <footer className="border-t border-[#E5DCCB] pt-6 pb-2 text-center text-xs text-stone-500">
        Review Engine is part of EnhanceRez. Replies are always drafts until the owner approves them.
      </footer>
    </main>
  );
}
