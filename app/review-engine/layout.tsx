import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Review Engine | More Google reviews for local shops',
  description:
    'Review Engine texts your customers after the job, sends happy customers to Google, keeps unhappy feedback private, and drafts a reply to every review for your approval.',
};

export default function ReviewEngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fraunces.variable} review-engine-scope min-h-screen bg-[#FAF8F4] text-stone-900 antialiased`}
    >
      <style>{`
        .review-engine-scope h1,
        .review-engine-scope h2,
        .review-engine-scope h3 {
          font-family: var(--font-fraunces), Georgia, 'Times New Roman', serif;
          letter-spacing: 0;
        }
      `}</style>
      {children}
    </div>
  );
}
