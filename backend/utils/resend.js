// Resend transactional email utility
// Install: npm install resend

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmailResend(to, otp) {
  let fromEmail = process.env.RESEND_FROM_EMAIL && process.env.RESEND_FROM_EMAIL.trim()
    ? process.env.RESEND_FROM_EMAIL.trim()
    : 'onboarding@resend.dev';
  // Resend does not allow unverified public domains like gmail.com
  if (fromEmail.toLowerCase().endsWith('@gmail.com')) {
    fromEmail = 'onboarding@resend.dev';
  }

  const response = await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Your OTP Code for Registration',
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  });

  // minimal debug log to help diagnose delivery without exposing secrets
  try {
    console.log('[Resend] email send result:', {
      id: response?.id || null,
      error: response?.error || null,
    });
  } catch (_) {}

  return response;
}

module.exports = { sendOTPEmailResend };