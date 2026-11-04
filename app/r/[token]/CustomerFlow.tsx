'use client';

import { useState } from 'react';

const primaryButtonClass =
  'block w-full rounded-full bg-stone-900 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-black disabled:opacity-60';
const secondaryButtonClass =
  'block w-full rounded-full border border-stone-900 bg-white px-6 py-4 text-center text-base font-semibold text-stone-900 transition hover:bg-[#F2EBDF] disabled:opacity-60';
const inputClass =
  'w-full rounded-2xl border border-[#E5DCCB] bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400';

type Stage = 'choose' | 'great' | 'feedback' | 'feedbackDone' | 'already';

export default function CustomerFlow({
  token,
  businessName,
  jobDescription,
  googleReviewUrl,
  initialStatus,
}: {
  token: string;
  businessName: string;
  jobDescription: string | null;
  googleReviewUrl: string;
  initialStatus: string;
}) {
  const [stage, setStage] = useState<Stage>(initialStatus === 'sent' ? 'choose' : 'already');
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  const chooseGreat = async () => {
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch(`/api/review-engine/public/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'happy' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setNotice(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStage('great');
    } catch {
      setNotice('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch(`/api/review-engine/public/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feedback', name, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStage('feedbackDone');
    } catch {
      setNotice('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (stage === 'already') {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-medium text-stone-900">Thank you</h1>
        <p className="text-sm leading-relaxed text-stone-500">
          You have already answered this one, and {businessName} has your response. We appreciate you taking the time.
        </p>
        {initialStatus === 'happy' && (
          <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}>
            Leave a Google review
          </a>
        )}
      </div>
    );
  }

  if (stage === 'great') {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-medium text-stone-900">Thank you, truly</h1>
        <p className="text-sm leading-relaxed text-stone-500">
          It means a lot to {businessName}. If you have a minute, a Google review helps other neighbours find the shop and helps the team more than almost anything else.
        </p>
        <a href={googleReviewUrl} target="_blank" rel="noopener noreferrer" className={primaryButtonClass}>
          Leave a Google review
        </a>
        <p className="text-xs text-stone-500">The button opens Google in a new tab. Nothing is posted for you.</p>
      </div>
    );
  }

  if (stage === 'feedbackDone') {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-medium text-stone-900">Thank you for telling us directly</h1>
        <p className="text-sm leading-relaxed text-stone-500">
          Your message went privately to the owner of {businessName}, not to a public page. That gives the shop a fair chance to make it right.
        </p>
      </div>
    );
  }

  if (stage === 'feedback') {
    return (
      <div className="space-y-5">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium text-stone-900">Tell the owner what happened</h1>
          <p className="text-sm leading-relaxed text-stone-500">
            This goes privately to {businessName}. It is not a public review, and the owner reads every message.
          </p>
        </div>
        <form onSubmit={submitFeedback} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="feedbackName" className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500">
              Your name, optional
            </label>
            <input id="feedbackName" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <label htmlFor="feedbackMessage" className="block text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500">
              What could have been better
            </label>
            <textarea id="feedbackMessage" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} placeholder="Tell us what went wrong, in your own words" />
          </div>
          {notice && <p className="text-sm text-stone-700">{notice}</p>}
          <button type="submit" disabled={busy || !message.trim()} className={primaryButtonClass}>
            {busy ? 'Sending...' : 'Send privately to the owner'}
          </button>
          <button type="button" onClick={() => setStage('choose')} disabled={busy} className="block w-full py-1 text-center text-sm font-medium text-stone-500 underline-offset-4 hover:underline">
            Back
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500">{businessName}</p>
        <h1 className="text-3xl font-medium leading-tight text-stone-900">Thanks for choosing {businessName}</h1>
        {jobDescription && <p className="text-sm text-stone-500">Your visit: {jobDescription}</p>}
        <p className="pt-1 text-xl text-stone-900" style={{ fontFamily: 'Georgia, serif' }}>How did we do?</p>
      </div>
      <div className="space-y-3">
        <button type="button" onClick={chooseGreat} disabled={busy} className={primaryButtonClass}>
          {busy ? 'One moment...' : 'It was great'}
        </button>
        <button type="button" onClick={() => setStage('feedback')} disabled={busy} className={secondaryButtonClass}>
          It could have been better
        </button>
      </div>
      {notice && <p className="text-center text-sm text-stone-700">{notice}</p>}
      <p className="text-center text-xs leading-relaxed text-stone-500">
        Great experiences go to Google, where they help the shop. Problems come to the owner first, privately.
      </p>
    </div>
  );
}
