import type { Metadata } from 'next';
import Link from 'next/link';
import SubscribeForm from '../SubscribeForm';

const ARTICLE_TITLE =
  'What Is a Good ATS Match Score? (And What to Do If Yours Is Low)';
const ARTICLE_DESCRIPTION =
  'Learn what an ATS match score measures, what the ranges tend to mean, why a perfect score is not the goal, and how to raise a low score honestly.';
const ARTICLE_URL =
  'https://www.enhancerez.com/blog/what-is-a-good-ats-match-score';

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

export default function AtsMatchScoreArticlePage() {
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
            You run a scan, you get a number, and the number feels like a verdict. A low score can
            make a strong candidate doubt a solid work history. A high score can create the opposite
            problem, a sense that the application is ready when a human reader would still find it
            vague. A score is useful only if you understand what it counts and what it cannot.
          </P>
          <P>
            Think of it as a comparison tool. It compares the language in your resume with the
            language in one specific job description. Change the posting and the score changes,
            even if your resume stays the same. It tells you how clearly this version answers this
            posting. It does not grade your career.
          </P>

          <StepHeading>What a match score actually measures</StepHeading>
          <P>
            Most scoring tools look at three broad areas. The first is skills overlap. The scanner
            pulls out the tools and abilities named in the posting and checks whether those terms
            appear in your resume in a credible context. If the posting asks for inventory
            management and customer support, it wants evidence of those things on your page.
          </P>
          <P>
            The second area is keyword coverage. Beyond the formal skills list, postings contain
            repeated words that describe how the work gets done. When your resume uses different
            words for the same work, a scanner may miss the connection even though a human reader
            would spot it. Coverage is about translation, making your experience legible to
            software and to a busy recruiter at the same time.
          </P>
          <P>
            The third area is measurable results. Strong resumes show scope and outcome with
            numbers. How many tickets, how many customers, how much time saved, and what improved
            as a result. A score will often flag resumes that list duties with no scale at all.
            Numbers alone do not earn a job, but they help a reader judge the impact of your work.
          </P>

          <StepHeading>What the ranges tend to mean</StepHeading>
          <P>
            Every tool calculates its score a little differently, so treat any range as general
            guidance rather than a fixed standard. With that caution in mind, many job seekers find
            it helpful to read scores in broad bands.
          </P>
          <ul className="space-y-2">
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">Below 50,</strong> the resume and
                the posting are probably speaking different languages, or the core skills in the
                posting are missing from the page. This is common when you send a general resume to
                a specialised role.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">50 to 69,</strong> there is a real
                overlap, but important terms or evidence are still absent or buried. Small and
                honest edits often move a resume through this band.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">70 to 84,</strong> this is a solid
                working range for many applications. The main skills are present, the language
                tracks the posting, and a reader can see the fit without hunting for it.
              </span>
            </li>
            <li className="flex gap-2 text-sm sm:text-[15px] leading-7 text-slate-600">
              <span className="text-amber-500 shrink-0">•</span>
              <span>
                <strong className="font-semibold text-slate-800">85 and above,</strong> the match
                looks very close on paper. That can be genuine, especially for a role that mirrors
                your recent work. It can also be a warning to reread for repetition and for claims
                you would struggle to support in an interview.
              </span>
            </li>
          </ul>
          <P>
            A solid score with clear and truthful bullets is a better application than a near
            perfect score built on copied phrases. Employers hire a person whose experience they
            can verify in conversation, not a percentage.
          </P>

          <StepHeading>Why a perfect score is not the goal</StepHeading>
          <P>
            Chasing 100 creates two risks. The first is overfitting. If you rewrite your resume to
            echo every line of one posting, it can read like the posting itself rather than like
            your work history. Recruiters notice that, and trust drops.
          </P>
          <P>
            The second risk is keyword stuffing, which means cramming terms into the page in ways
            that do not reflect real duties. That might mean listing tools you have only opened
            once or repeating a phrase in every bullet. Even if it lifts a score in one tool, it
            makes the resume weaker where it matters, in the interview.
          </P>
          <P>
            A posting may also ask for a tool you do not have. No honest edit can close that gap.
            A good score should reflect a real match, including where the match ends.
          </P>

          <StepHeading>Why a low score happens</StepHeading>
          <P>
            In most cases a low score has ordinary causes. You used a general resume for a specific
            role. You described the same work with different words than the employer uses. Your best
            evidence sits low on the page, or your bullets list responsibilities with no numbers to
            show scale.
          </P>
          <P>
            None of those causes means you are unqualified. The document is simply not making the
            case as clearly as it could, and that is fixable without inventing anything. For a
            fuller method, our guide on{' '}
            <Link
              href="/blog/how-to-tailor-your-resume-to-a-job-description"
              className="text-amber-600 font-semibold hover:underline"
            >
              how to tailor your resume to a job description
            </Link>{' '}
            walks through the process in order.
          </P>

          <StepHeading>How to raise a low score honestly</StepHeading>
          <P>
            Start with the posting itself. Highlight every skill you can honestly claim and set
            aside the rest. Then check your resume against that truthful list. Where a claimed
            skill is missing, add it where a reader would expect it, in your summary, in a skills
            section, or inside a bullet that shows how you used it.
          </P>
          <P>
            Next, translate your language. If the posting says client onboarding and your resume says
            helped new customers get started, and those describe the same work, use the term from
            the posting and keep your detail around it. Translation changes only the label, so a
            scanner and a recruiter both recognise what you did.
          </P>
          <P>
            Then add the numbers you already know. How many people were on the team. How many cases
            you handled in a typical week. How long a process took before and after a change.
            Use honest approximations where exact figures are not available and be ready to explain
            them. Never add a figure you cannot stand behind.
          </P>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Before
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-600">
                &quot;Helped customers with questions and problems.&quot;
              </p>
            </div>
            <div className="bg-white border border-amber-300 rounded-xl p-4 space-y-1 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                After, using only true detail
              </p>
              <p className="text-sm sm:text-[15px] leading-7 text-slate-800">
                &quot;Resolved customer support questions by phone and email, handling about 30 cases
                a day and documenting each resolution in the ticketing system.&quot;
              </p>
            </div>
          </div>
          <P>
            The second version scores better for an honest reason. It names the work in the words a
            posting would use, it shows volume, and it names the system where the work was recorded.
            It adds clarity, not fiction. That distinction is the whole method.
          </P>
          <P>
            Finally, reorder and prune. Move your strongest matching bullets to the top of each role
            and shorten less relevant duties so the match does not get lost. Then scan again and
            read the result aloud. If a line sounds like something you could not explain to a
            manager, rewrite it.
          </P>

          <StepHeading>How EnhanceRez reports the score</StepHeading>
          <P>
            On{' '}
            <Link href="/" className="text-amber-600 font-semibold hover:underline">
              EnhanceRez
            </Link>{' '}
            the free scan returns a Match Rate in about 30 seconds, with skill and metrics checklists
            that show what was found and what appears to be missing. You paste in your resume and the
            job description and you can scan with no account needed. Use the checklists as an editing
            list, not as an instruction to claim everything on them. Add what is true, leave what is
            not, and check the revised version once more.
          </P>
          <P>
            The scan is free. Downloads run on credits, and the free tier includes 3 download credits
            per week, with one credit per unique document. Pro is $12 per month with a 7 day free
            trial, unlimited downloads, all 3 templates, and the Job Application Tracker. There is
            also a cover letter generator if the role asks for a letter. See{' '}
            <Link href="/pricing" className="text-amber-600 font-semibold hover:underline">
              pricing
            </Link>{' '}
            for the full breakdown.
          </P>
          <P>
            A good target is not a perfect number. A good target is a resume that scores in a solid
            range because the match is real, reads clearly to a person, and leaves you ready to talk
            through every line with confidence. When the number and the reading experience agree,
            the application is ready to send.
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
