import { Fraunces } from 'next/font/google';
import { getRequestByToken } from '@/lib/review-engine';
import CustomerFlow from './CustomerFlow';

export const dynamic = 'force-dynamic';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export default async function CustomerPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let request = null;
  try {
    request = await getRequestByToken(token);
  } catch {
    request = null;
  }

  return (
    <main
      className={`${fraunces.variable} min-h-screen bg-[#FAF8F4] px-4 py-10 text-stone-900 antialiased`}
    >
      <style>{`
        h1 { font-family: var(--font-fraunces), Georgia, 'Times New Roman', serif; }
      `}</style>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-[#E5DCCB] bg-white p-6 sm:p-8">
        {request ? (
          <CustomerFlow
            token={token}
            businessName={request.business_name}
            jobDescription={request.job_description}
            googleReviewUrl={request.google_review_url}
            initialStatus={request.status}
          />
        ) : (
          <div className="space-y-4 text-center">
            <h1 className="text-3xl font-medium text-stone-900">This link is not active</h1>
            <p className="text-sm leading-relaxed text-stone-500">
              We could not find that request. It may have been typed in wrong, or the shop may have sent you a newer link. Please check the most recent text from the shop, or ask them to send it again.
            </p>
          </div>
        )}
      </div>
      <p className="pt-6 text-center text-xs text-stone-500">Powered by Review Engine</p>
    </main>
  );
}
