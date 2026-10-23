import type { Metadata } from 'next';
import Link from 'next/link';

const ARTICLE_TITLE =
  'How to Tailor Your Resume to a Job Description (So It Passes the ATS)';
const ARTICLE_DESCRIPTION =
  "Learn how to tailor your resume to a job description: mirror the posting's language, lead with measurable results, and check your match before you send.";
const ARTICLE_URL =
  'https://enhancerez.com/blog/how-to-tailor-your-resume-to-a-job-description';

export const metadata: Metadata = {
  title: `${ARTICLE_TITLE} | EnhanceRez`,
  description: ARTICLE_DESCRIPTION,
  openGraph: {
    title: `${ARTICLE_TITLE} | EnhanceRez`,
    description: ARTICLE_DESCRIPTION,
    url: ARTICLE_URL,
    siteName: 'EnhanceRez',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: `${ARTICLE_TITLE} | EnhanceRez`,
    description: ARTICLE_DESCRIPTION,
  },
};

function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-6">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm sm:text-[15px] leading-7 text-slate-600">{children}</p>;
}

export default function TailorResumeArticlePage() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased px-4 py-6 sm:px-6 sm:py-10">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center border-b border-slate-200 pb-4">
          <Link href="/" className="text-2xl font-bold font-serif text-slate-900">
            Enhancerez<span className="text-amber-600">.com</span>
          </Link>
          <Link
            href="/blog"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            ← All articles
          </Link>
        </header>

        <article className="space-y-4 pt-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {ARTICLE_TITLE}
          </h1>

          <P>
            Most job seekers have one resume. They send it to thirty jobs, hear back from almost
            none of them, and conclude the market is brutal. Often the real problem is duller: the
            resume was written to describe their career in general, and every posting they applied
            to was asking for something specific.
          </P>
          <P>
            Tailoring fixes that. It means adjusting your resume for each job so it clearly matches
            what that employer is screening for, first by software, then by a recruiter who spends
            seconds on the first pass. Here is how to do it well, step by step.
          </P>

          <StepHeading>Step 1: Read the posting like a checklist, not an ad</StepHeading>
          <P>
            Job descriptions are usually written from the hiring manager&apos;s actual list of
            needs, in rough priority order. Read the responsibilities and requirements sections
            slowly and pull out three things:
          </P>
          <ul className="space-y-2">
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Hard skills,</strong> the tools,
                software, methods, and certifications named outright.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Soft skills,</strong> the
                qualities they repeat, like &quot;cross-functional,&quot; &quot;fast-paced,&quot;
                and &quot;client-facing.&quot;
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Outcomes they care about,</strong>{' '}
                the results mentioned or implied, like reduced costs, faster turnaround, retention,
                accuracy, and growth.
              </span>
            </li>
          </ul>
          <P>
            Repeat mentions matter. If a posting says &quot;stakeholder communication&quot; twice
            and buries it in two different sections, that is not filler. It is the job.
          </P>

          <StepHeading>Step 2: Mirror the language, honestly</StepHeading>
          <P>
            Applicant tracking systems search for terms, and recruiters skim for them too. If the
            posting says &quot;inventory management&quot; and your resume says &quot;kept track of
            stock,&quot; you may have done the job and still never surface in a search.
          </P>
          <P>
            Go through your bullet points and swap in the posting&apos;s exact terms where they
            are true. Same with job titles. If your title was unusual (&quot;Customer Happiness
            Associate&quot;) and the posting is for a &quot;Customer Support Specialist,&quot; it
            is standard practice to present your title accurately but recognizably. Many people use
            the industry standard equivalent with their real title in parentheses. Never claim a
            skill, tool, or certification you do not have. Mirroring is about translation, not
            invention, and any gap will surface in the first interview.
          </P>

          <StepHeading>Step 3: Reorder so the match is obvious</StepHeading>
          <P>
            Whatever the posting emphasizes most should appear earliest in your resume. Applying
            for a support role that leads with troubleshooting? Your troubleshooting work should
            lead your most recent job entry, not sit fourth in the list under routine duties.
          </P>
          <P>
            This also applies to your summary. Two or three lines at the top should state your
            experience in the posting&apos;s own terms: your years in the field, the core skills
            it names, and one result that proves them. Write a fresh summary for each application.
            It is the highest leverage paragraph on the page.
          </P>

          <StepHeading>Step 4: Turn duties into results</StepHeading>
          <P>
            The single biggest difference between a tailored resume and a generic one is measurable
            results. Compare:
          </P>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                The duty
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-600">
                &quot;Responsible for processing customer refunds.&quot;
              </p>
            </div>
            <div className="bg-white border border-amber-300 rounded-xl p-4 space-y-1 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                The result
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-800">
                &quot;Processed 40+ customer refunds daily with a 98% accuracy rate.&quot;
              </p>
            </div>
          </div>
          <P>
            Screeners, human and software alike, look for numbers because numbers are evidence. Go
            through each role and ask: how many, how often, how much, how fast, what improved?
            Ticket counts, team sizes, dollar amounts, turnaround times, error rates, customer
            counts. If you do not know an exact figure, use an honest approximation
            (&quot;~200 accounts&quot;), but never invent a number you cannot stand behind if
            asked about it. The examples above are illustrations of the kind of bullet to write
            from your own work history, with your own real figures.
          </P>

          <StepHeading>Step 5: Prune what does not serve this application</StepHeading>
          <P>
            Tailoring is not only adding. Work that is irrelevant to this posting takes up space
            and dilutes the match. You do not have to delete an old job, since employment gaps
            raise their own questions, but you can shrink it to a line or two and give the
            recovered space to the experience this employer cares about. Aim for one page for most
            roles unless you have a long, relevant history.
          </P>

          <StepHeading>Step 6: Sanity check the format</StepHeading>
          <P>
            ATS software reads simple documents best. Use standard section headings
            (&quot;Experience,&quot; &quot;Education,&quot; &quot;Skills&quot;), a common font, and
            no tables, text boxes, headers or footers with key information, or graphics. Save as
            PDF unless the posting asks for a Word document. And proofread. A tailored resume with
            a typo in the employer&apos;s own keyword is a special kind of own goal.
          </P>

          <StepHeading>Step 7: Check your match before you send</StepHeading>
          <P>
            Finally, compare your finished resume against the posting one more time. Every hard
            skill you genuinely have should be findable on the page. Your summary should sound like
            an answer to their ad. Your strongest matching results should be visible in the first
            half of the first page.
          </P>
          <P>
            If you want that check done for you, this is exactly what{' '}
            <Link href="/" className="text-amber-600 font-semibold hover:underline">
              EnhanceRez
            </Link>{' '}
            does: paste your resume and the job description, and you get a Match Rate with the
            skill and metrics checklists in about 30 seconds, free, with no sign up. It is a fast
            way to catch what your own eyes have stopped seeing after the fifth read through.
          </P>
          <P>
            The scan is free. Downloads run on credits, and the free tier includes 3 download
            credits per week, one credit per document. If you are applying to a lot of roles, Pro
            is $12/month with a 7 day free trial and unlimited downloads. See{' '}
            <Link href="/pricing" className="text-amber-600 font-semibold hover:underline">
              pricing
            </Link>{' '}
            for the full breakdown.
          </P>

          <StepHeading>The habit that matters</StepHeading>
          <P>
            Tailoring every application feels slower than blasting one resume everywhere. In
            practice it is the opposite: five applications you are visibly qualified for outperform
            fifty that a screener has to squint at. Treat each posting as a question and your
            resume as the answer, and the silence after applying gets a lot shorter.
          </P>

          <div className="bg-white border border-amber-300 rounded-2xl p-6 mt-8 space-y-3 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Check your match before you send
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
              Paste your resume and a job description into EnhanceRez and get your Match Rate in
              about 30 seconds. Free, and no sign up is needed to scan.
            </p>
            <Link
              href="/"
              className="inline-block bg-amber-400 text-slate-950 font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-amber-300 transition shadow"
            >
              Run the free scan
            </Link>
            <p className="text-[11px] text-slate-500">
              Applying to several roles?{' '}
              <Link href="/pricing" className="text-amber-600 hover:underline">
                See Pro pricing
              </Link>
              .
            </p>
          </div>
        </article>
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
