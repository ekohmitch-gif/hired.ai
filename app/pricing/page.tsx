import type { Metadata } from 'next';
import Link from 'next/link';

// The Pro subscription price is configured in Stripe (STRIPE_PRICE_ID) and
// is intentionally NOT stored in this codebase — the code only knows the
// price ID. Set this display string from the live Stripe price.
const PRO_PRICE_DISPLAY = '[set from Stripe price]';

export const metadata: Metadata = {
  title: 'Pricing — EnhanceRez | AI Resume Builder',
  description:
    'EnhanceRez pricing: scan your resume and build for free with 3 weekly download credits, or go Pro for unlimited downloads, all templates, and the job tracker.',
};

const FREE_FEATURES = [
  'Resume scan with ATS match score — no account needed',
  'AI resume rewrite tailored to each job description',
  'Tailored cover letter generation',
  'Live Builder with real-time preview',
  'Classic resume template',
  '3 Rez Points per week — download credits for PDF and DOCX exports (sign-in required to download)',
];

const PRO_FEATURES = [
  'Unlimited downloads — no weekly Rez Points cap',
  'All 3 templates: Classic, Modern, and Minimal',
  'Job Application Tracker',
  'Everything in Free',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-800 pb-4">
          <Link href="/" className="text-2xl font-bold font-serif text-white">
            Enhancerez<span className="text-amber-400">.com</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
          >
            ← Back to home
          </Link>
        </header>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white tracking-tight">Pricing</h2>
          <p className="text-xs text-slate-400">
            Scanning, building, and previewing are free. You only need Pro when you run out of weekly
            downloads or want every template and the job tracker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Free</h3>
              <p className="text-3xl font-bold text-white mt-1">
                $0
              </p>
              <p className="text-[11px] text-slate-500">No card required. Sign in only when you download.</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-amber-400 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center bg-slate-800 text-slate-100 font-semibold text-xs py-2.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition"
            >
              Start scanning — free
            </Link>
          </section>

          {/* Pro */}
          <section className="bg-slate-900/40 border border-amber-400/40 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Pro</h3>
              <p className="text-3xl font-bold text-white mt-1">{PRO_PRICE_DISPLAY}</p>
              <p className="text-[11px] text-slate-500">Subscription billed through Stripe at checkout.</p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                  <span className="text-amber-400 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center bg-amber-400 text-slate-950 font-semibold text-xs py-2.5 rounded-lg hover:bg-amber-300 transition"
            >
              Upgrade from the app
            </Link>
          </section>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Rez Points reset weekly and are only spent when you download a finished document — generating,
          scanning, and previewing never cost points. Questions about billing? Reach us through the{' '}
          <Link href="/contact" className="text-amber-400 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
