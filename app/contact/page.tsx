import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact, EnhanceRez | AI Resume Builder',
  description: 'Get in touch with the builder of EnhanceRez via GitHub or LinkedIn.',
};

export default function ContactPage() {
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
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Contact</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            EnhanceRez is designed, built, and supported by Mitchell Ekoh. There&apos;s no support
            ticket system. The fastest way to reach him is one of these:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://www.linkedin.com/in/mitchell-ekoh"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-slate-200 rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-amber-300 transition"
          >
            <p className="text-sm font-bold text-slate-900">LinkedIn</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Best for product questions, feedback, and billing help. Mention EnhanceRez in your
              message.
            </p>
            <p className="text-xs text-amber-600">linkedin.com/in/mitchell-ekoh →</p>
          </a>

          <a
            href="https://github.com/ekohmitch-gif"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-slate-200 rounded-2xl p-5 space-y-1.5 shadow-sm hover:border-amber-300 transition"
          >
            <p className="text-sm font-bold text-slate-900">GitHub</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Best for bug reports and feature requests, and to see the other projects behind
              EnhanceRez.
            </p>
            <p className="text-xs text-amber-600">github.com/ekohmitch-gif →</p>
          </a>
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
