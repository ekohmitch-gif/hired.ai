import type { Metadata } from 'next';
import Link from 'next/link';

// Pro price confirmed by the owner on Oct 19, 2026: $12.00/month. The amount
// is charged via the Stripe price in STRIPE_PRICE_ID — keep this display
// string in sync if the Stripe price ever changes.
const PRO_PRICE_DISPLAY = '$12/month';

export const metadata: Metadata = {
  title: 'Pricing, EnhanceRez | AI Resume Builder',
  description:
    'EnhanceRez pricing: scan your resume and build for free with 3 weekly download credits, or go Pro for unlimited downloads, all templates, and the job tracker.',
};

const FREE_FEATURES = [
  'Resume scan with ATS match score, no account needed',
  'AI resume rewrite tailored to each job description',
  'Tailored cover letter generation',
  'Live Builder with real-time preview',
  'Classic resume template',
  '3 Rez Points per week, download credits for PDF and DOCX exports (sign-in required to download)',
];

const PRO_FEATURES = [
  'Unlimited downloads, no weekly Rez Points cap',
  'All 3 templates: Classic, Modern, and Minimal',
  'Job Application Tracker',
  'Everything in Free',
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center border-b border-slate-200 pb-4">
          <Link href="/" className="text-2xl font-bold font-serif text-slate-900">
            Enhancerez<span className="text-amber-600">.com</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            ← Back to home
          </Link>
        </header>

        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pricing</h2>
          <p className="text-xs text-slate-500">
            Scanning, building, and previewing are free. You only need Pro when you run out of weekly
            downloads or want every template and the job tracker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Free</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                $0
              </p>
              <p className="text-[11px] text-slate-500">No card required. Sign in only when you download.</p>
            </div>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                  <span className="text-amber-500 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center bg-white text-slate-700 font-semibold text-xs py-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
            >
              Start scanning, free
            </Link>
          </section>

          {/* Pro */}
          <section className="bg-white border border-amber-300 rounded-2xl p-6 space-y-4 shadow-lg shadow-amber-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pro</h3>
              <p className="text-3xl font-bold text-slate-900 mt-1">{PRO_PRICE_DISPLAY}</p>
              <p className="text-[11px] text-slate-500">Subscription billed through Stripe at checkout.</p>
            </div>
            <ul className="space-y-2">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                  <span className="text-amber-500 shrink-0">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="block text-center bg-amber-400 text-slate-950 font-semibold text-xs py-2.5 rounded-lg hover:bg-amber-300 transition shadow"
            >
              Upgrade from the app
            </Link>
          </section>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Rez Points reset weekly and are only spent when you download a finished document, generating,
          scanning, and previewing never cost points. Questions about billing? Reach us through the{' '}
          <Link href="/contact" className="text-amber-600 hover:underline">
            contact page
          </Link>
          .
        </p>
      </div>

      {/* Site Footer */}
      <footer className="max-w-5xl mx-auto mt-10 border-t border-slate-200 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Enhancerez<span className="text-amber-600">.com</span>, AI Resume Builder
        </p>
        <nav className="flex items-center gap-4 text-[11px] text-slate-500">
          <Link href="/pricing" className="hover:text-amber-600 transition">Pricing</Link>
          <Link href="/terms" className="hover:text-amber-600 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-600 transition">Privacy</Link>
          <Link href="/contact" className="hover:text-amber-600 transition">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}
