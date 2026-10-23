import { sql } from '@/lib/db';
import {
  ensureBlogSubscribersTable,
  verifyUnsubscribeToken,
} from '@/lib/subscribers';

function page(title: string, message: string, status: number): Response {
  const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>${title}, EnhanceRez</title></head>
<body style="margin:0;padding:0;background-color:#FAFAF9;">
<div style="max-width:560px;margin:0 auto;padding:48px 20px;font-family:Arial,Helvetica,sans-serif;">
<p style="font-size:20px;font-weight:bold;color:#0F172A;margin:0 0 16px;">Enhancerez<span style="color:#D97706;">.com</span></p>
<div style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:16px;padding:28px;">
<h1 style="font-size:20px;color:#0F172A;margin:0 0 12px;">${title}</h1>
<p style="font-size:14px;line-height:1.65;color:#334155;margin:0;">${message}</p>
<p style="font-size:14px;line-height:1.65;color:#334155;margin:14px 0 0;"><a href="https://www.enhancerez.com/blog" style="color:#D97706;">Back to the blog</a></p>
</div>
<p style="font-size:11px;color:#64748B;margin:16px 0 0;">EnhanceRez, AI Resume Builder</p>
</div>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// GET: unsubscribe a blog subscriber. The link carries the email and an
// HMAC token minted for that address (see lib/subscribers.ts), so only
// someone holding the link from the email can unsubscribe the address.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || '').trim().toLowerCase();
  const token = searchParams.get('token') || '';

  if (!email || !verifyUnsubscribeToken(email, token)) {
    return page(
      'That link is not valid',
      'This unsubscribe link is incomplete or no longer matches our records. If you keep receiving blog emails you did not ask for, reach us through the contact page and we will sort it out.',
      400
    );
  }

  try {
    await ensureBlogSubscribersTable();
    await sql`
      UPDATE blog_subscribers
      SET unsubscribed_at = NOW()
      WHERE email = ${email}
    `;
  } catch (error) {
    console.error('Blog unsubscribe error:', error);
    return page(
      'Something went wrong',
      'We could not complete the unsubscribe just now. Please try the link again in a few minutes.',
      500
    );
  }

  return page(
    'You are unsubscribed',
    'You will not receive blog emails from EnhanceRez at this address any more. You can subscribe again from the blog whenever you like.',
    200
  );
}
