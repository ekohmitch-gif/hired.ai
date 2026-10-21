/*
 * STARTER DRAFT — owner to review before relying on it.
 * Plain-language starter terms for EnhanceRez. Have a professional
 * review this before treating it as a final legal document.
 */
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service, EnhanceRez | AI Resume Builder',
  description: 'The terms for using EnhanceRez, the AI resume builder at enhancerez.com.',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
      <div className="text-xs text-slate-600 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Terms of Service</h2>
          <p className="text-xs text-slate-500">Last updated: October 2026</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <Section title="What EnhanceRez is">
            <p>
              EnhanceRez is an AI-assisted resume tool. You provide a resume and a job description, and
              the service produces an ATS match score, a tailored rewrite of your resume, and cover
              letters. Scanning and building are free; downloads and some features use credits or a Pro
              subscription as described on the pricing page.
            </p>
          </Section>

          <Section title="Your account">
            <p>
              Sign-in is handled by Clerk. You are responsible for keeping your account credentials
              secure and for everything done under your account. You must be old enough to form a
              binding contract in your jurisdiction to use the paid features.
            </p>
          </Section>

          <Section title="Your content and your responsibility">
            <p>
              You own the resume content you provide and the documents you generate. AI output can
              contain errors, and match scores are estimates, not guarantees. You are responsible for
              reviewing every document before you send it to an employer and for making sure everything
              in it is true and accurate for you. Do not use EnhanceRez to create documents that
              misrepresent your identity, history, or qualifications.
            </p>
          </Section>

          <Section title="Credits and subscriptions">
            <p>
              Free accounts receive a weekly allowance of download credits (&quot;Rez Points&quot;) that
              reset each week and have no cash value. Pro subscriptions are billed through Stripe at
              the price shown at checkout. To cancel, reach out through the contact page and we will
              cancel your subscription for you; cancellation stops future billing.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Do not abuse, overload, reverse-engineer, or attempt to gain unauthorized access to the
              service, and do not use it to violate any law or anyone else&apos;s rights. We may suspend
              accounts that do.
            </p>
          </Section>

          <Section title="No guarantees">
            <p>
              EnhanceRez helps you present your experience; it does not guarantee interviews, job
              offers, or any particular outcome with any employer or applicant tracking system. The
              service is provided &quot;as is,&quot; and to the extent permitted by law we disclaim
              warranties and limit liability for indirect damages arising from use of the service.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              We may update these terms or the service itself. Material changes will be posted on this
              page with a new date. Continuing to use EnhanceRez after a change means you accept the
              updated terms.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about these terms? Reach us through the{' '}
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
