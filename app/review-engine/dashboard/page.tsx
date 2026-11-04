'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser, ClerkLoaded } from '@clerk/nextjs';

interface Shop {
  id: string;
  business_name: string;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  google_review_url: string;
  service_types: string | null;
  baseline_review_count: number;
  current_review_count: number;
  window_start: string;
}

interface ReviewRequest {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  job_description: string | null;
  status: string;
  sms_status: string | null;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  customer_name: string | null;
  message: string;
  draft_reply: string | null;
  approved_reply: string | null;
  status: string;
  created_at: string;
}

interface ReviewItem {
  id: string;
  reviewer_name: string | null;
  rating: number | null;
  review_text: string | null;
  job_description: string | null;
  draft_reply: string | null;
  approved_reply: string | null;
  status: string;
  review_date: string | null;
  created_at: string;
}

const labelClass =
  'block text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500';
const inputClass =
  'w-full rounded-2xl border border-[#E5DCCB] bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-stone-400';
const panelClass = 'rounded-3xl border border-[#E5DCCB] bg-white p-6 sm:p-8';
const primaryButtonClass =
  'rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-60';
const smallButtonClass =
  'rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-[#F2EBDF] disabled:opacity-60';

function formatDate(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusLabel(status: string): string {
  if (status === 'happy') return 'Went to Google';
  if (status === 'feedback') return 'Sent private feedback';
  if (status === 'drafted') return 'Draft ready';
  if (status === 'approved') return 'Approved';
  if (status === 'new') return 'New';
  return 'Sent';
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button type="button" onClick={copy} className={smallButtonClass}>
      {copied ? 'Copied' : label}
    </button>
  );
}

function ReplyManager({
  kind,
  item,
  approvedHint,
  onUpdate,
}: {
  kind: 'reviews' | 'feedback';
  item: ReviewItem | FeedbackItem;
  approvedHint: string;
  onUpdate: (item: ReviewItem | FeedbackItem) => void;
}) {
  const [text, setText] = useState(item.approved_reply || item.draft_reply || '');
  const [busy, setBusy] = useState<'draft' | 'approve' | null>(null);
  const [notice, setNotice] = useState('');

  // The parent gives this component a key built from the saved draft
  // and approved reply, so a fresh draft or approval remounts it with
  // the saved text in the box and no effect based syncing is needed.
  const draft = async () => {
    setBusy('draft');
    setNotice('');
    try {
      const res = await fetch(`/api/review-engine/${kind}/${item.id}/draft`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Drafting is unavailable right now.');
        return;
      }
      onUpdate(kind === 'reviews' ? data.review : data.feedback);
    } catch {
      setNotice('Drafting is unavailable right now.');
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    setBusy('approve');
    setNotice('');
    try {
      const res = await fetch(`/api/review-engine/${kind}/${item.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedReply: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Could not approve that reply.');
        return;
      }
      onUpdate(kind === 'reviews' ? data.review : data.feedback);
    } catch {
      setNotice('Could not approve that reply.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#F2EBDF] px-3 py-1 text-[11px] font-semibold text-stone-700">
          {statusLabel(item.status)}
        </span>
        <button type="button" onClick={draft} disabled={busy !== null} className={smallButtonClass}>
          {busy === 'draft' ? 'Drafting...' : item.draft_reply ? 'Draft again' : 'Draft a reply'}
        </button>
      </div>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your reply will appear here. Draft one, or write your own, then approve it."
        className={inputClass}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={approve} disabled={busy !== null || !text.trim()} className={primaryButtonClass}>
          {busy === 'approve' ? 'Approving...' : 'Approve reply'}
        </button>
        {text.trim() && <CopyButton text={text} label="Copy reply" />}
      </div>
      {item.status === 'approved' && <p className="text-xs leading-relaxed text-stone-500">{approvedHint}</p>}
      {notice && <p className="text-xs leading-relaxed text-stone-700">{notice}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const [shopForm, setShopForm] = useState({
    businessName: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    googleReviewUrl: '',
    serviceTypes: '',
    baselineReviewCount: '',
  });
  const [savingShop, setSavingShop] = useState(false);
  const [shopNotice, setShopNotice] = useState('');

  const [progressCount, setProgressCount] = useState('');
  const [savingProgress, setSavingProgress] = useState(false);

  const [sendForm, setSendForm] = useState({ customerName: '', customerPhone: '', jobDescription: '' });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ link: string; smsStatus: string } | null>(null);
  const [sendNotice, setSendNotice] = useState('');

  const [reviewForm, setReviewForm] = useState({
    reviewerName: '',
    rating: '5',
    reviewText: '',
    jobDescription: '',
    reviewDate: '',
  });
  const [addingReview, setAddingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState('');

  const loadAll = useCallback(async () => {
    // Loading starts as true on first mount, and later reloads swap the
    // data in place, so there is no synchronous loading reset here.
    try {
      const shopRes = await fetch('/api/review-engine/shop');
      const shopData = await shopRes.json();
      const loadedShop: Shop | null = shopData.shop || null;
      setShop(loadedShop);
      if (loadedShop) {
        setShopForm({
          businessName: loadedShop.business_name || '',
          ownerName: loadedShop.owner_name || '',
          ownerEmail: loadedShop.owner_email || '',
          ownerPhone: loadedShop.owner_phone || '',
          googleReviewUrl: loadedShop.google_review_url || '',
          serviceTypes: loadedShop.service_types || '',
          baselineReviewCount: String(loadedShop.baseline_review_count ?? 0),
        });
        setProgressCount(String(loadedShop.current_review_count ?? 0));
        const [reqRes, fbRes, revRes] = await Promise.all([
          fetch('/api/review-engine/requests'),
          fetch('/api/review-engine/feedback'),
          fetch('/api/review-engine/reviews'),
        ]);
        const reqData = await reqRes.json();
        const fbData = await fbRes.json();
        const revData = await revRes.json();
        setRequests(reqData.requests || []);
        setFeedback(fbData.feedback || []);
        setReviews(revData.reviews || []);
      }
    } catch {
      // Panels stay empty and the owner can retry by reloading.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) loadAll();
  }, [isSignedIn, loadAll]);

  const saveShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShop(true);
    setShopNotice('');
    try {
      const res = await fetch('/api/review-engine/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: shopForm.businessName,
          ownerName: shopForm.ownerName,
          ownerEmail: shopForm.ownerEmail,
          ownerPhone: shopForm.ownerPhone,
          googleReviewUrl: shopForm.googleReviewUrl,
          serviceTypes: shopForm.serviceTypes,
          baselineReviewCount: Number(shopForm.baselineReviewCount || 0),
          currentReviewCount: shop
            ? shop.current_review_count
            : Number(shopForm.baselineReviewCount || 0),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setShopNotice(data.error || 'Could not save your shop.');
        return;
      }
      setShop(data.shop);
      setProgressCount(String(data.shop.current_review_count ?? 0));
      setShowSettings(false);
      if (!shop) loadAll();
    } catch {
      setShopNotice('Could not save your shop.');
    } finally {
      setSavingShop(false);
    }
  };

  const saveProgress = async () => {
    setSavingProgress(true);
    try {
      const res = await fetch('/api/review-engine/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentReviewCount: Number(progressCount || 0) }),
      });
      const data = await res.json();
      if (res.ok && data.shop) setShop(data.shop);
    } catch {
      // The card keeps the last saved count.
    } finally {
      setSavingProgress(false);
    }
  };

  const sendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSendNotice('');
    setSendResult(null);
    try {
      const res = await fetch('/api/review-engine/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendNotice(data.error || 'Could not create that request.');
        return;
      }
      setRequests((prev) => [data.request, ...prev]);
      setSendResult({ link: data.request.link, smsStatus: data.request.sms_status || 'no_phone' });
      setSendForm({ customerName: '', customerPhone: '', jobDescription: '' });
    } catch {
      setSendNotice('Could not create that request.');
    } finally {
      setSending(false);
    }
  };

  const addReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingReview(true);
    setReviewNotice('');
    try {
      const res = await fetch('/api/review-engine/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: reviewForm.reviewerName,
          rating: Number(reviewForm.rating),
          reviewText: reviewForm.reviewText,
          jobDescription: reviewForm.jobDescription,
          reviewDate: reviewForm.reviewDate || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewNotice(data.error || 'Could not add that review.');
        return;
      }
      setReviews((prev) => [data.review, ...prev]);
      setReviewForm({ reviewerName: '', rating: '5', reviewText: '', jobDescription: '', reviewDate: '' });
    } catch {
      setReviewNotice('Could not add that review.');
    } finally {
      setAddingReview(false);
    }
  };

  if (!isLoaded) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-sm text-stone-500">Loading your dashboard...</p>
      </main>
    );
  }

  if (!isSignedIn) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className={`${panelClass} space-y-5 text-center`}>
          <p className={labelClass}>Owner dashboard</p>
          <h1 className="text-3xl font-medium text-stone-900 sm:text-4xl">Sign in to run your Review Engine</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-500">
            Your shop settings, customer requests, private feedback, and review replies all live here, tied to your account.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <ClerkLoaded>
              <SignInButton mode="modal">
                <button className={primaryButtonClass}>Sign in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full border border-stone-900 px-6 py-3 text-sm font-semibold text-stone-900 transition hover:bg-[#F2EBDF]">
                  Create an account
                </button>
              </SignUpButton>
            </ClerkLoaded>
          </div>
          <p className="text-xs text-stone-500">
            New here? Start on the{' '}
            <Link href="/review-engine" className="font-medium text-stone-900 underline underline-offset-4">
              Review Engine page
            </Link>{' '}
            to read how it works.
          </p>
        </div>
      </main>
    );
  }

  const gained = shop ? shop.current_review_count - shop.baseline_review_count : 0;
  const progressPct = Math.max(0, Math.min(100, Math.round((gained / 30) * 100)));
  let daysLeft = 60;
  if (shop?.window_start) {
    const start = new Date(`${shop.window_start}T00:00:00`);
    const end = new Date(start.getTime() + 60 * 24 * 60 * 60 * 1000);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
  }

  const shopFormPanel = (
    <form onSubmit={saveShop} className={`${panelClass} space-y-5`}>
      <div className="space-y-2">
        <p className={labelClass}>{shop ? 'Shop settings' : 'Set up your shop'}</p>
        <h2 className="text-2xl font-medium text-stone-900">
          {shop ? 'Update your shop details' : 'Tell us about your shop'}
        </h2>
        {!shop && (
          <p className="text-sm leading-relaxed text-stone-500">
            This takes a few minutes. You can change any of it later.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="businessName">Business name</label>
          <input id="businessName" required value={shopForm.businessName} onChange={(e) => setShopForm({ ...shopForm, businessName: e.target.value })} className={inputClass} placeholder="Your shop name" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="ownerName">Your name</label>
          <input id="ownerName" value={shopForm.ownerName} onChange={(e) => setShopForm({ ...shopForm, ownerName: e.target.value })} className={inputClass} placeholder="Owner name" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="ownerEmail">Your email</label>
          <input id="ownerEmail" type="email" value={shopForm.ownerEmail} onChange={(e) => setShopForm({ ...shopForm, ownerEmail: e.target.value })} className={inputClass} placeholder="Where feedback alerts should go" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="ownerPhone">Your mobile</label>
          <input id="ownerPhone" type="tel" value={shopForm.ownerPhone} onChange={(e) => setShopForm({ ...shopForm, ownerPhone: e.target.value })} className={inputClass} placeholder="Your mobile number" />
        </div>
      </div>
      <div className="space-y-2">
        <label className={labelClass} htmlFor="googleReviewUrl">Google review link</label>
        <input id="googleReviewUrl" required value={shopForm.googleReviewUrl} onChange={(e) => setShopForm({ ...shopForm, googleReviewUrl: e.target.value })} className={inputClass} placeholder="Paste your Google review link" />
        <p className="text-xs leading-relaxed text-stone-500">
          Paste the g.page link or the Google review link from your business listing. Happy customers land on this page.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className={labelClass} htmlFor="serviceTypes">Services you offer</label>
          <input id="serviceTypes" value={shopForm.serviceTypes} onChange={(e) => setShopForm({ ...shopForm, serviceTypes: e.target.value })} className={inputClass} placeholder="For example, cuts, color, repairs" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="baselineReviewCount">Google reviews today</label>
          <input id="baselineReviewCount" type="number" min="0" value={shopForm.baselineReviewCount} onChange={(e) => setShopForm({ ...shopForm, baselineReviewCount: e.target.value })} className={inputClass} placeholder="0" />
          <p className="text-xs leading-relaxed text-stone-500">This is your guarantee baseline. We count new reviews from here.</p>
        </div>
      </div>
      {shopNotice && <p className="text-sm text-stone-700">{shopNotice}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={savingShop} className={primaryButtonClass}>
          {savingShop ? 'Saving...' : shop ? 'Save settings' : 'Save and open my dashboard'}
        </button>
        {shop && (
          <button type="button" onClick={() => setShowSettings(false)} className={smallButtonClass}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DCCB] pb-5">
        <div>
          <p className={labelClass}>Review Engine</p>
          <h1 className="pt-1 text-2xl font-medium text-stone-900 sm:text-3xl">
            {shop ? shop.business_name : 'Owner dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/review-engine" className="text-sm font-medium text-stone-600 underline-offset-4 hover:underline">
            Product page
          </Link>
          <ClerkLoaded>
            <UserButton />
          </ClerkLoaded>
        </div>
      </header>

      {loading ? (
        <p className="py-12 text-sm text-stone-500">Loading your shop...</p>
      ) : !shop ? (
        <div className="py-8">{shopFormPanel}</div>
      ) : (
        <div className="space-y-6 py-8">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowSettings(!showSettings)} className={smallButtonClass}>
              {showSettings ? 'Hide settings' : 'Shop settings'}
            </button>
          </div>
          {showSettings && shopFormPanel}

          <section className="rounded-3xl border border-[#E5DCCB] bg-[#F2EBDF] p-6 sm:p-8">
            <p className={labelClass}>The guarantee</p>
            <h2 className="pt-2 text-2xl font-medium text-stone-900">
              {gained > 0 ? `${gained} new Google reviews so far` : 'Your 60 day window is running'}
            </h2>
            <p className="pt-3 text-sm leading-relaxed text-stone-500">
              Goal is 30 more reviews in 60 days. You started at {shop.baseline_review_count} reviews and your listing is at {shop.current_review_count} now, with {daysLeft} days left in the window.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-stone-900" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="pt-2 text-xs text-stone-500">{progressPct} percent of the way to 30</p>
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="progressCount">Reviews on Google today</label>
                <input id="progressCount" type="number" min="0" value={progressCount} onChange={(e) => setProgressCount(e.target.value)} className="w-40 rounded-2xl border border-[#E5DCCB] bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-stone-400" />
              </div>
              <button type="button" onClick={saveProgress} disabled={savingProgress} className={smallButtonClass}>
                {savingProgress ? 'Saving...' : 'Update count'}
              </button>
            </div>
          </section>

          <section className={panelClass}>
            <p className={labelClass}>Send a request</p>
            <h2 className="pt-2 text-2xl font-medium text-stone-900">Ask a customer how it went</h2>
            <form onSubmit={sendRequest} className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-3">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="customerName">Customer name</label>
                <input id="customerName" required value={sendForm.customerName} onChange={(e) => setSendForm({ ...sendForm, customerName: e.target.value })} className={inputClass} placeholder="Customer name" />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="customerPhone">Mobile number</label>
                <input id="customerPhone" type="tel" value={sendForm.customerPhone} onChange={(e) => setSendForm({ ...sendForm, customerPhone: e.target.value })} className={inputClass} placeholder="Mobile number" />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="jobDescription">Job in one line</label>
                <input id="jobDescription" value={sendForm.jobDescription} onChange={(e) => setSendForm({ ...sendForm, jobDescription: e.target.value })} className={inputClass} placeholder="For example, brake pads and rotors" />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" disabled={sending} className={primaryButtonClass}>
                  {sending ? 'Sending...' : 'Send the request'}
                </button>
              </div>
            </form>
            {sendNotice && <p className="pt-3 text-sm text-stone-700">{sendNotice}</p>}
            {sendResult && sendResult.smsStatus === 'sent' && (
              <p className="pt-4 text-sm leading-relaxed text-stone-700">
                Text sent. Your customer has the link, and their answer will show up below.
              </p>
            )}
            {sendResult && sendResult.smsStatus !== 'sent' && (
              <div className="space-y-3 pt-4">
                <p className="text-sm leading-relaxed text-stone-700">
                  {sendResult.smsStatus === 'no_phone'
                    ? 'No mobile number was added, so here is the customer link to send yourself.'
                    : 'Automatic texting is not switched on yet, copy the link and send it from your own phone.'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="max-w-full overflow-x-auto rounded-full bg-[#F2EBDF] px-4 py-2 text-xs text-stone-800">{sendResult.link}</code>
                  <CopyButton text={sendResult.link} label="Copy link" />
                </div>
              </div>
            )}

            <div className="space-y-3 pt-8">
              <h3 className="text-lg font-medium text-stone-900">Requests sent</h3>
              {requests.length === 0 ? (
                <p className="text-sm text-stone-500">No requests yet. Send your first one after the next job.</p>
              ) : (
                <ul className="divide-y divide-[#E5DCCB]">
                  {requests.map((request) => (
                    <li key={request.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{request.customer_name}</p>
                        <p className="text-xs text-stone-500">
                          {request.job_description ? `${request.job_description} · ` : ''}
                          {formatDate(request.created_at)}
                          {request.sms_status ? ` · Text ${request.sms_status === 'sent' ? 'sent' : 'not sent automatically'}` : ''}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#F2EBDF] px-3 py-1 text-[11px] font-semibold text-stone-700">
                        {statusLabel(request.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className={panelClass}>
            <p className={labelClass}>Private feedback</p>
            <h2 className="pt-2 text-2xl font-medium text-stone-900">Concerns that came to you first</h2>
            <p className="pt-3 text-sm leading-relaxed text-stone-500">
              Draft a reply, edit it until it sounds like you, and approve it. Approving only saves your reply here, ready to copy and send to the customer yourself.
            </p>
            {feedback.length === 0 ? (
              <p className="pt-5 text-sm text-stone-500">No private feedback yet. When a customer chooses that path, their message lands here and we email you.</p>
            ) : (
              <div className="space-y-6 pt-5">
                {feedback.map((item) => (
                  <article key={item.id} className="border-t border-[#E5DCCB] pt-5">
                    <p className="text-sm font-medium text-stone-900">{item.customer_name || 'A customer'}</p>
                    <p className="text-xs text-stone-500">{formatDate(item.created_at)}</p>
                    <p className="pt-2 text-sm leading-relaxed text-stone-700">{item.message}</p>
                    <ReplyManager
                      key={`${item.id}:${item.draft_reply || ''}:${item.approved_reply || ''}`}
                      kind="feedback"
                      item={item}
                      approvedHint="Approved. Copy this reply and send it to the customer directly from your own phone or email."
                      onUpdate={(updated) =>
                        setFeedback((prev) => prev.map((f) => (f.id === updated.id ? (updated as FeedbackItem) : f)))
                      }
                    />
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={panelClass}>
            <p className={labelClass}>Google reviews</p>
            <h2 className="pt-2 text-2xl font-medium text-stone-900">Replies to your Google reviews</h2>
            <p className="pt-3 text-sm leading-relaxed text-stone-500">
              Reviews are added here by hand for now, and approved replies are ready to copy and paste under the review on Google until the Google connection is finished. Nothing is ever posted for you from this page.
            </p>
            <form onSubmit={addReview} className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClass} htmlFor="reviewerName">Reviewer name</label>
                <input id="reviewerName" value={reviewForm.reviewerName} onChange={(e) => setReviewForm({ ...reviewForm, reviewerName: e.target.value })} className={inputClass} placeholder="Name on the review" />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="rating">Rating</label>
                <select id="rating" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })} className={inputClass}>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} of 5</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className={labelClass} htmlFor="reviewText">Review text</label>
                <textarea id="reviewText" required rows={3} value={reviewForm.reviewText} onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })} className={inputClass} placeholder="Paste the review exactly as it appears on Google" />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="reviewJob">Job in one line</label>
                <input id="reviewJob" value={reviewForm.jobDescription} onChange={(e) => setReviewForm({ ...reviewForm, jobDescription: e.target.value })} className={inputClass} placeholder="The job this review was about" />
              </div>
              <div className="space-y-2">
                <label className={labelClass} htmlFor="reviewDate">Review date</label>
                <input id="reviewDate" type="date" value={reviewForm.reviewDate} onChange={(e) => setReviewForm({ ...reviewForm, reviewDate: e.target.value })} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" disabled={addingReview} className={primaryButtonClass}>
                  {addingReview ? 'Adding...' : 'Add review'}
                </button>
                {reviewNotice && <p className="pt-3 text-sm text-stone-700">{reviewNotice}</p>}
              </div>
            </form>

            {reviews.length === 0 ? (
              <p className="pt-6 text-sm text-stone-500">No reviews added yet. Add your newest Google review above and draft its reply.</p>
            ) : (
              <div className="space-y-6 pt-6">
                {reviews.map((item) => (
                  <article key={item.id} className="border-t border-[#E5DCCB] pt-5">
                    <p className="text-sm font-medium text-stone-900">
                      {item.reviewer_name || 'A reviewer'}
                      {item.rating ? <span className="text-stone-500"> · {item.rating} of 5</span> : null}
                    </p>
                    <p className="text-xs text-stone-500">
                      {formatDate(item.review_date || item.created_at)}
                      {item.job_description ? ` · ${item.job_description}` : ''}
                    </p>
                    <p className="pt-2 text-sm leading-relaxed text-stone-700">{item.review_text}</p>
                    <ReplyManager
                      key={`${item.id}:${item.draft_reply || ''}:${item.approved_reply || ''}`}
                      kind="reviews"
                      item={item}
                      approvedHint="Approved. Copy this reply and paste it under the review on Google. It has not been posted anywhere."
                      onUpdate={(updated) =>
                        setReviews((prev) => prev.map((r) => (r.id === updated.id ? (updated as ReviewItem) : r)))
                      }
                    />
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
