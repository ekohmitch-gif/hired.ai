'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'done' | 'error';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus('done');
        setMessage(
          'You are subscribed.'
        );
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">
        New guides, straight to your inbox
      </h2>
      <p className="text-sm text-slate-500 leading-relaxed">
        Subscribe and we will email you when a new guide is published. We only
        email people who subscribed, and you can unsubscribe at any time.
      </p>
      {status === 'done' ? (
        <p className="text-sm font-semibold text-emerald-700">{message}</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex-1 text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-slate-900 text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-slate-700 transition disabled:opacity-50"
          >
            {status === 'sending' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && (
        <p className="text-sm font-semibold text-red-600">{message}</p>
      )}
    </div>
  );
}
