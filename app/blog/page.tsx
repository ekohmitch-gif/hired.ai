import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog, EnhanceRez | AI Resume Builder',
  description:
    'Practical guides from EnhanceRez on resumes and job applications, starting with how to tailor your resume to a job description so it passes the ATS.',
  openGraph: {
    title: 'Blog, EnhanceRez | AI Resume Builder',
    description:
      'Practical guides from EnhanceRez on resumes and job applications, starting with how to tailor your resume to a job description so it passes the ATS.',
    url: 'https://enhancerez.com/blog',
    siteName: 'EnhanceRez',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Blog, EnhanceRez | AI Resume Builder',
    description:
      'Practical guides from EnhanceRez on resumes and job applications, starting with how to tailor your resume to a job description so it passes the ATS.',
  },
};

const ARTICLES = [
  {
    href: '/blog/how-to-tailor-your-resume-to-a-job-description',
    title: 'How to Tailor Your Resume to a Job Description (So It Passes the ATS)',
    description:
      'A step by step guide to matching your resume to each posting: mirror the language, lead with results, and check your match before you send.',
  },
];

export default function BlogIndexPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blog</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Plain, practical guides on resumes and job applications. No fluff, and no advice we
            would not give a friend who is applying this week.
          </p>
        </div>

        <div className="space-y-4">
          {ARTICLES.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="block bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-2 shadow-sm hover:border-amber-300 transition"
            >
              <h2 className="text-lg font-bold text-slate-900 leading-snug">{a.title}</h2>
              <p className="text-sm text-slate-500 leading-relaxed">{a.description}</p>
              <p className="text-xs text-amber-600 font-semibold">Read the guide →</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Site Footer */}
      <footer className="max-w-3xl mx-auto mt-10 border-t border-slate-200 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Enhancerez<span className="text-amber-600">.com</span>, AI Resume Builder
        </p>
        <nav className="flex items-center gap-4 text-[11px] text-slate-500">
          <Link href="/pricing" className="hover:text-amber-600 transition">Pricing</Link>
          <Link href="/blog" className="hover:text-amber-600 transition">Blog</Link>
          <Link href="/terms" className="hover:text-amber-600 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-600 transition">Privacy</Link>
          <Link href="/contact" className="hover:text-amber-600 transition">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}
