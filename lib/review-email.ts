import { sendEmail, SITE_URL } from '@/lib/email';

// Owner alert for private customer feedback. sendEmail already stays
// silent when Resend is not configured and never throws, so this helper
// is safe to fire from the public feedback endpoint.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendFeedbackAlertEmail(input: {
  ownerEmail?: string | null;
  ownerName?: string | null;
  businessName: string;
  customerName?: string | null;
  message: string;
  jobDescription?: string | null;
}): Promise<boolean> {
  const to = input.ownerEmail?.trim();
  if (!to) {
    console.log('[review-email] No owner email on file, skipping feedback alert.');
    return false;
  }

  const dashboardUrl = `${SITE_URL}/review-engine/dashboard`;
  const greeting = input.ownerName?.trim() ? `Hi ${input.ownerName.trim()},` : 'Hi,';
  const fromLine = input.customerName?.trim()
    ? `From: ${input.customerName.trim()}`
    : 'From: a customer who did not leave a name';
  const jobLine = input.jobDescription?.trim() ? `Job: ${input.jobDescription.trim()}` : null;

  const text = `${greeting}

A customer sent private feedback to ${input.businessName} instead of posting a public review.

${fromLine}
${jobLine ? `${jobLine}\n` : ''}
What they said:
${input.message}

Open your dashboard to read it, draft a reply, and approve it before anything is sent:
${dashboardUrl}

Review Engine`;

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#FAF8F4;">
<div style="max-width:560px;margin:0 auto;padding:32px 20px;font-family:Arial,Helvetica,sans-serif;">
<p style="font-size:20px;font-weight:bold;color:#1C1917;margin:0 0 16px;">Review Engine</p>
<div style="background-color:#FFFFFF;border:1px solid #E5DCCB;border-radius:16px;padding:28px;">
<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 14px;">${escapeHtml(greeting)}</p>
<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 14px;">A customer sent private feedback to ${escapeHtml(input.businessName)} instead of posting a public review.</p>
<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 6px;">${escapeHtml(fromLine)}</p>
${jobLine ? `<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 6px;">${escapeHtml(jobLine)}</p>` : ''}
<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 6px;">What they said:</p>
<p style="font-size:14px;line-height:1.65;color:#1C1917;margin:0 0 14px;">${escapeHtml(input.message)}</p>
<p style="font-size:14px;line-height:1.65;color:#44403C;margin:0 0 14px;">Open your dashboard to read it, draft a reply, and approve it before anything is sent: <a href="${dashboardUrl}" style="color:#1C1917;">${dashboardUrl}</a></p>
</div>
<p style="font-size:11px;color:#78716C;margin:16px 0 0;">Review Engine</p>
</div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `Private feedback for ${input.businessName}`,
    html,
    text,
  });
}
