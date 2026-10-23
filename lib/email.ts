import { Resend } from 'resend';

// Transactional and list email for EnhanceRez, sent through Resend.
//
// Safety rules for this module:
// - When RESEND_API_KEY is not set, every send logs and skips without
//   throwing, so the app behaves exactly as before until the owner adds
//   the key.
// - A send failure must never break the caller. Webhooks and the
//   subscribe route treat email as best effort, so this helper always
//   resolves and never rejects.

const EMAIL_FROM =
  process.env.EMAIL_FROM || 'EnhanceRez <hello@enhancerez.com>';

// Public site origin used in email links. Falls back to the live domain
// (not localhost) because email links are opened outside the app.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.enhancerez.com';

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email] RESEND_API_KEY is not set, skipping email to ${to} (${subject})`
    );
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error(`[email] Resend could not send to ${to}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Unexpected failure sending to ${to}:`, err);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Bright, minimal shell shared by every email: warm white background,
// one white card, restrained type, one amber accent in the wordmark.
function emailHtml(paragraphs: string[], footerExtra?: string): string {
  const body = paragraphs
    .map(
      (p) =>
        `<p style="font-size:14px;line-height:1.65;color:#334155;margin:0 0 14px;">${p}</p>`
    )
    .join('\n');
  const footer = footerExtra
    ? `<p style="font-size:11px;line-height:1.6;color:#64748B;margin:16px 0 0;">${footerExtra}</p>`
    : '';
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#FAFAF9;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Arial,Helvetica,sans-serif;">
<p style="font-size:20px;font-weight:bold;color:#0F172A;margin:0 0 16px;">Enhancerez<span style="color:#D97706;">.com</span></p>
<div style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
${body}
</div>
<p style="font-size:11px;color:#64748B;margin:16px 0 0;">EnhanceRez, AI Resume Builder</p>
${footer}
</div>
</body>
</html>`;
}

function greeting(firstName?: string): { text: string; html: string } {
  const name = firstName?.trim();
  if (!name) return { text: 'Hi,', html: 'Hi,' };
  return { text: `Hi ${name},`, html: `Hi ${escapeHtml(name)},` };
}

export async function sendWelcomeEmail(
  to: string,
  firstName?: string
): Promise<boolean> {
  const hi = greeting(firstName);
  const text = `${hi.text}

Welcome to EnhanceRez. Your account is ready, and here is what it can do for you.

Paste in your resume and a job description, and EnhanceRez scores how well the two match, then tailors your resume and writes a cover letter for that posting. Everything you generate is saved in your account, and you can download it again anytime as a PDF or Word file.

Free accounts get 3 credits a week, and each document costs one credit. Pro is $12.00 a month and begins with a 7 day free trial.

Start here: ${SITE_URL}

Questions? Reach us any time through the contact page at ${SITE_URL}/contact

EnhanceRez, AI Resume Builder`;

  const html = emailHtml([
    hi.html,
    'Welcome to EnhanceRez. Your account is ready, and here is what it can do for you.',
    'Paste in your resume and a job description, and EnhanceRez scores how well the two match, then tailors your resume and writes a cover letter for that posting. Everything you generate is saved in your account, and you can download it again anytime as a PDF or Word file.',
    'Free accounts get 3 credits a week, and each document costs one credit. Pro is $12.00 a month and begins with a 7 day free trial.',
    `Start here: <a href="${SITE_URL}" style="color:#D97706;">${SITE_URL}</a>`,
    `Questions? Reach us any time through the <a href="${SITE_URL}/contact" style="color:#D97706;">contact page</a>.`,
  ]);

  return sendEmail({ to, subject: 'Welcome to EnhanceRez', html, text });
}

export async function sendTrialEndingEmail(
  to: string,
  trialEndDate: string | null
): Promise<boolean> {
  const when = trialEndDate ? ` on ${trialEndDate}` : ' soon';
  const subject = trialEndDate
    ? `Your EnhanceRez Pro trial ends on ${trialEndDate}`
    : 'Your EnhanceRez Pro trial is ending soon';
  const text = `Hi,

Your 7 day free trial of EnhanceRez Pro ends${when}. Your paid subscription then begins at $12.00 a month, billed to the payment method you used at checkout.

If Pro is working for you, you do not need to do anything. If you would rather not continue, cancel before the trial ends and you will not be charged.

Whenever a subscription ends, the account returns to the free plan with 3 credits a week, and saved resumes and cover letters stay in the account.

Questions? Reach us through the contact page at ${SITE_URL}/contact

EnhanceRez, AI Resume Builder`;

  const html = emailHtml([
    'Hi,',
    `Your 7 day free trial of EnhanceRez Pro ends${when}. Your paid subscription then begins at $12.00 a month, billed to the payment method you used at checkout.`,
    'If Pro is working for you, you do not need to do anything. If you would rather not continue, cancel before the trial ends and you will not be charged.',
    'Whenever a subscription ends, the account returns to the free plan with 3 credits a week, and saved resumes and cover letters stay in the account.',
    `Questions? Reach us through the <a href="${SITE_URL}/contact" style="color:#D97706;">contact page</a>.`,
  ]);

  return sendEmail({ to, subject, html, text });
}

export async function sendPaymentFailedEmail(to: string): Promise<boolean> {
  const text = `Hi,

We tried to renew your EnhanceRez Pro subscription, and the payment did not go through. This can happen when a card expires or a bank declines the charge.

Your payment may be retried automatically, but it is worth checking the payment method on your subscription. If the payment does not succeed, the subscription will end and your account will return to the free plan with 3 credits a week. Your saved resumes and cover letters stay in your account either way.

Questions? Reach us through the contact page at ${SITE_URL}/contact

EnhanceRez, AI Resume Builder`;

  const html = emailHtml([
    'Hi,',
    'We tried to renew your EnhanceRez Pro subscription, and the payment did not go through. This can happen when a card expires or a bank declines the charge.',
    'Your payment may be retried automatically, but it is worth checking the payment method on your subscription. If the payment does not succeed, the subscription will end and your account will return to the free plan with 3 credits a week. Your saved resumes and cover letters stay in your account either way.',
    `Questions? Reach us through the <a href="${SITE_URL}/contact" style="color:#D97706;">contact page</a>.`,
  ]);

  return sendEmail({
    to,
    subject: 'Your EnhanceRez Pro payment did not go through',
    html,
    text,
  });
}

export async function sendCancellationEmail(to: string): Promise<boolean> {
  const text = `Hi,

This email confirms that your EnhanceRez Pro subscription has been cancelled, so you will not be billed again.

Your account is now on the free plan, which includes 3 credits a week at one credit per document. Your saved resumes and cover letters are still in your account, and you can download them again anytime.

If you cancelled by mistake, or you want Pro again later, you can restart any time from the pricing page: ${SITE_URL}/pricing

EnhanceRez, AI Resume Builder`;

  const html = emailHtml([
    'Hi,',
    'This email confirms that your EnhanceRez Pro subscription has been cancelled, so you will not be billed again.',
    'Your account is now on the free plan, which includes 3 credits a week at one credit per document. Your saved resumes and cover letters are still in your account, and you can download them again anytime.',
    `If you cancelled by mistake, or you want Pro again later, you can restart any time from the <a href="${SITE_URL}/pricing" style="color:#D97706;">pricing page</a>.`,
  ]);

  return sendEmail({
    to,
    subject: 'Your EnhanceRez Pro subscription has been cancelled',
    html,
    text,
  });
}

export async function sendBlogConfirmationEmail(
  to: string,
  unsubscribeUrl: string
): Promise<boolean> {
  const text = `Hi,

You are subscribed to the EnhanceRez blog. We will email you when we publish a new guide, and that is all we send to this list. New guides cover practical resume and job application topics, like matching your resume to a job description so it passes the screening systems employers use.

Read the latest guide here: ${SITE_URL}/blog

If you did not subscribe, or you change your mind, you can unsubscribe at any time:
${unsubscribeUrl}

EnhanceRez, AI Resume Builder`;

  const html = emailHtml(
    [
      'Hi,',
      'You are subscribed to the EnhanceRez blog. We will email you when we publish a new guide, and that is all we send to this list. New guides cover practical resume and job application topics, like matching your resume to a job description so it passes the screening systems employers use.',
      `Read the latest guide here: <a href="${SITE_URL}/blog" style="color:#D97706;">${SITE_URL}/blog</a>`,
    ],
    `If you did not subscribe, or you change your mind, you can <a href="${unsubscribeUrl}" style="color:#64748B;text-decoration:underline;">unsubscribe at any time</a>.`
  );

  return sendEmail({
    to,
    subject: 'You are subscribed to the EnhanceRez blog',
    html,
    text,
  });
}
