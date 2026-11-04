// SMS sending through Twilio, shaped as a small adapter so the rest of
// the Review Engine never touches Twilio details directly.
//
// When the Twilio settings are not present in the environment, sending
// logs and returns a not_configured result without throwing, so the app
// keeps working and the owner can copy the customer link and send it
// from their own phone instead. Send failures are caught the same way.

export interface SmsResult {
  sent: boolean;
  reason?: string;
  sid?: string;
}

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.log('[sms] Twilio is not configured, skipping text message.');
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const form = new URLSearchParams();
    form.set('From', fromNumber);
    form.set('To', to);
    form.set('Body', body);

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization:
            'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      }
    );

    if (!response.ok) {
      console.error(`[sms] Twilio returned status ${response.status}.`);
      return { sent: false, reason: 'send_failed' };
    }

    const data = (await response.json().catch(() => ({}))) as { sid?: string };
    return { sent: true, sid: data.sid };
  } catch (err) {
    console.error('[sms] Unexpected failure sending a text message:', err);
    return { sent: false, reason: 'send_failed' };
  }
}
