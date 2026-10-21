/*
 * STARTER DRAFT — owner to review before relying on it.
 * Plain-language starter privacy policy for EnhanceRez. Have a
 * professional review this before treating it as a final legal
 * document.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy, EnhanceRez | AI Resume Builder',
  description: 'How EnhanceRez handles your account information, resume content, and payments.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      <div className="text-xs text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-3xl mx-auto space-y-6">
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Privacy Policy</h2>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <Section title="What we collect">
            <p>
              <strong className="text-slate-900">Account information.</strong> When you sign in, our
              authentication provider (Clerk) gives us your name and email address and stores your
              sign-in details.
            </p>
            <p>
              <strong className="text-slate-900">Your documents.</strong> The resume text or files and
              job descriptions you submit, the documents generated from them, and, if you choose to
              save them, your saved resumes and job application records.
            </p>
            <p>
              <strong className="text-slate-900">Payments.</strong> Subscriptions are processed by
              Stripe. We never see or store your full card number; Stripe gives us confirmation of
              payment and subscription status.
            </p>
          </Section>

          <Section title="How we use it">
            <p>
              We use your information only to run the service: to score and rewrite your resume,
              generate cover letters, save the documents you ask us to keep, track your download
              credits, and manage your subscription.
            </p>
          </Section>

          <Section title="Who processes it">
            <p>
              A few providers process data on our behalf, only so the service works: Clerk
              (authentication), OpenAI (AI processing of the resume and job description text you
              submit), Stripe (payments), and Neon (database hosting for saved resumes and
              applications). We do not sell your personal information.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Clerk and Stripe may set cookies that are necessary for sign-in and secure checkout. We
              do not run advertising trackers.
            </p>
          </Section>

          <Section title="Retention and your choices">
            <p>
              Saved resumes and application records stay until you delete them in the app or ask us to
              remove them. You can request deletion of your account data at any time through the{' '}
              <Link href="/contact" className="text-amber-600 hover:underline">
                contact page
              </Link>
              , and we will delete it except where we must keep records for legal or billing reasons.
            </p>
          </Section>

          <Section title="Security">
            <p>
              Accounts are protected by Clerk&apos;s authentication and data is transmitted over HTTPS.
              No system is perfectly secure, so please do not put information in a resume that you
              would not share with a prospective employer.
            </p>
          </Section>

          <Section title="Changes and contact">
            <p>
              If this policy changes, we will post the new version here with a new date. Questions
              about your privacy can be sent through the{' '}
              <Link href="/contact" className="text-amber-600 hover:underline">
                contact page
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>

      {/* Site Footer */}
      <footer className="max-w-3xl mx-auto mt-10 border-t border-slate-200 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
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
