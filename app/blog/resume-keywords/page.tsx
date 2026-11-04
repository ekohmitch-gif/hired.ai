import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeForm from '../SubscribeForm';

const ARTICLE_TITLE =
  'Resume Keywords: What They Are, Where to Find Them, and How to Use Them';
const ARTICLE_DESCRIPTION =
  'Learn what resume keywords are, where to find them in a job posting, how to place them naturally, and why stuffing them in hurts more than it helps.';
const ARTICLE_URL = 'https://www.enhancerez.com/blog/resume-keywords';

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

export default function ResumeKeywordsArticlePage() {
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
            Keywords sound like a trick, as if a resume succeeds because it contains a secret set of
            words. In practice the idea is much simpler. Employers describe a job in specific
            language. Software and recruiters then search for that same language in applications. If
            your resume describes the same work in completely different words, the connection can be
            missed even when you are qualified.
          </P>
          <P>
            Used well, keywords are translation. They help a reader recognize your experience
            quickly and accurately. Used badly, they turn a resume into a list of borrowed phrases
            that no interview could support. This guide covers where keywords come from, where they
            belong on the page, and how to use them without crossing that line.
          </P>

          <StepHeading>What resume keywords actually are</StepHeading>
          <P>
            A resume keyword is a word or phrase that describes a skill, a tool, a duty, or a result
            that matters for a particular job. Some are concrete, like the name of a software
            system or a task such as inventory management. Others are broader phrases such as
            customer support, quality checks, or team training.
          </P>
          <P>
            Keywords matter because two groups rely on them. Recruiters search applicant tracking
            systems for candidates using terms drawn from the role they are filling, and postings
            are where those terms are most visible. When a person reads your resume, they skim
            with those same terms in mind. Matching the language helps at each stage, but only
            when the language is true.
          </P>

          <StepHeading>Where to find keywords in a posting</StepHeading>
          <P>
            The posting itself is the best source, and it repays a slow read. Start with the
            responsibilities section, where the daily work is described. If a responsibility is
            listed early and in detail, treat it as a priority for that employer.
          </P>
          <P>
            Move next to the requirements section. This is where hard skills, tools, education, and
            certifications are usually named outright. Separate what you genuinely have from what
            you do not. The first group belongs somewhere on your resume. The second group does not,
            no matter how often it appears in the posting.
          </P>
          <P>
            Then look for repetition across the whole posting. A term that appears in the title and
            again in the responsibilities is not filler. It is a signal about what the team cares
            about most.
          </P>
          <ul className="space-y-2">
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Responsibilities,</strong> the
                duties and outcomes the role owns day to day.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Requirements,</strong> the tools,
                skills, and credentials named as needed for the job.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Repeated terms,</strong> the words
                and phrases the posting returns to more than once.
              </span>
            </li>
          </ul>

          <StepHeading>How to place keywords naturally</StepHeading>
          <P>
            A keyword earns its place when it sits inside a sentence about your real work. The
            summary is a good home for the two or three most important terms for the role, written
            as part of a short description of your experience. Two or three lines that name your
            field, your strongest relevant skills, and one result will do more than a paragraph that
            tries to mention everything.
          </P>
          <P>
            The skills section is the clearest home for tools and methods. List the relevant skills
            you actually have, in the language the posting uses, and keep the list focused on this
            application. A long and general list dilutes the match. A short and relevant list makes
            it easy for software to index you and easy for a person to confirm the fit at a glance.
          </P>
          <P>
            Bullets under each job are where a keyword becomes evidence of real work. A skill
            named only in a list is a claim. The same skill inside a bullet that
            shows what you did, how often you did it, and what resulted is proof. Wherever you can,
            let your bullets do that work. Our guide on{' '}
            <Link
              href="/blog/how-to-tailor-your-resume-to-a-job-description"
              className="text-amber-600 font-semibold hover:underline"
            >
              how to tailor your resume to a job description
            </Link>{' '}
            shows how reordering those bullets changes what a reader sees first.
          </P>

          <StepHeading>A worked example, with no invented facts</StepHeading>
          <P>
            Imagine a posting for a support role that repeats three phrases. It asks for customer
            support, ticket documentation, and issue resolution, and it mentions handling a high
            volume of requests. Now take a real person whose actual work fits that posting. They
            did support customers by phone and by email, they resolved common account issues, and
            they documented each ticket in a system so the next agent could follow the case. Their
            current bullet, though, says none of that. It is honest but vague, and it hides the
            facts that matter most.
          </P>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Weak bullet
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-600">
                &quot;Answered questions and helped customers solve problems.&quot;
              </p>
            </div>
            <div className="bg-white border border-amber-300 rounded-xl p-4 space-y-1 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                Stronger bullet, same facts stated clearly
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-800">
                &quot;Provided customer support by phone and email, resolved common account issues,
                and documented each ticket so the next agent could follow the case.&quot;
              </p>
            </div>
          </div>
          <P>
            Nothing new has been invented in the second version, because every detail in it was
            stated up front as this person&apos;s real work. No tool has been added, no number has
            been created, and no duty has been claimed beyond the work they actually did. The
            change is that the work is now described in the terms the employer uses, with enough
            detail for a reader to picture it. If the person in this example did handle a known
            volume, they could add that true figure. If they did not track it, the bullet still
            works without one.
          </P>

          <StepHeading>What keyword stuffing is, and why it hurts</StepHeading>
          <P>
            Keyword stuffing means forcing terms into a resume in ways that do not reflect real
            experience. Common forms include repeating the same phrase in every bullet, listing
            tools you cannot use with confidence, copying lines from the posting as if they were
            your duties, and adding long blocks of words that have no connection to any job you
            held.
          </P>
          <P>
            It hurts for practical reasons. Recruiters read for credibility, and stuffed language
            reads as borrowed. It also creates a painful interview, because every term on the page
            invites a question. If you listed a system, expect to be asked what you did in it. A
            resume should set up an interview you can do well in, not one you have to survive.
          </P>
          <P>
            There is a useful test for each keyword you add. Could you give a short and truthful
            example of using it in your own work, with a beginning, an action, and a result. If the
            answer is yes, the keyword belongs. If the answer is no, leave it out and strengthen a
            bullet about work you actually did instead. Over a full application, that discipline
            produces a stronger document than any shortcut.
          </P>

          <StepHeading>A simple process you can reuse</StepHeading>
          <P>
            Read the posting once for the story of the job, then again to pull out the
            responsibilities, the requirements, and the repeated terms. Build a short list of the
            terms you can honestly claim, place the most important ones in your summary and skills
            section, and weave the rest into bullets that carry evidence. Read the result aloud
            and rewrite any sentence that sounds like the posting talking about itself.
          </P>
          <P>
            If you want help spotting what is missing,{' '}
            <Link href="/" className="text-amber-600 font-semibold hover:underline">
              EnhanceRez
            </Link>{' '}
            offers a free scan. You paste in your resume and the job description and get a Match
            Rate with skill and metrics checklists in about 30 seconds, with no account needed to
            scan. Treat the checklist as a prompt for honest edits. It can show you a term from the
            posting that is absent from your page, but only you can decide whether that term
            truthfully belongs there. You can also read more about what the number means in our
            guide to{' '}
            <Link
              href="/blog/what-is-a-good-ats-match-score"
              className="text-amber-600 font-semibold hover:underline"
            >
              what a good ATS match score is
            </Link>
            .
          </P>
          <P>
            Because tailoring is work you repeat for each posting, the pricing follows that rhythm.
            The scan itself is free. The free tier includes 3 download credits per week for the
            versions you tailor, and one credit covers each unique document. For people tailoring
            often, Pro is $12 per month with a 7 day free trial, with unlimited downloads, all 3
            templates, and the Job Application Tracker, and there is a cover letter generator as
            well. See{' '}
            <Link href="/pricing" className="text-amber-600 font-semibold hover:underline">
              pricing
            </Link>{' '}
            for the full breakdown. Keywords will not get you a job on their own. Placed honestly,
            inside clear evidence of your work, they make sure the right reader gets the chance to
            consider you for it.
          </P>

          <div className="bg-white border border-amber-300 rounded-2xl p-6 mt-8 space-y-3 shadow-sm text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Check your match before you send
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
              Paste your resume and a job description into EnhanceRez and get your Match Rate in
              about 30 seconds. Free, and no account is needed to scan.
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

        <div className="pt-8">
          <SubscribeForm />
        </div>
      </div>

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
