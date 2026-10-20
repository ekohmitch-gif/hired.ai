import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact — EnhanceRez | AI Resume Builder',
  description: 'Get in touch with the builder of EnhanceRez via GitHub or LinkedIn.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-6">
      <div className="max-w-3xl mx-auto space-y-6">
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
          <h2 className="text-3xl font-bold text-white tracking-tight">Contact</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            EnhanceRez is designed, built, and supported by Mitchell Ekoh. There&apos;s no support
            ticket system — the fastest way to reach him is one of these:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://www.linkedin.com/in/mitchell-ekoh"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-1.5 hover:border-amber-400/40 transition"
          >
            <p className="text-sm font-bold text-white">LinkedIn</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Best for product questions, feedback, and billing help. Mention EnhanceRez in your
              message.
            </p>
            <p className="text-xs text-amber-400">linkedin.com/in/mitchell-ekoh →</p>
          </a>

          <a
            href="https://github.com/ekohmitch-gif"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-1.5 hover:border-amber-400/40 transition"
          >
            <p className="text-sm font-bold text-white">GitHub</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Best for bug reports and feature requests, and to see the other projects behind
              EnhanceRez.
            </p>
            <p className="text-xs text-amber-400">github.com/ekohmitch-gif →</p>
          </a>
        </div>
      </div>
    </main>
  );
}
