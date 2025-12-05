// Resend transactional email utility
// Install: npm install resend

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOTPEmailResend(to, otp) {
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: 'Your OTP Code for Registration',
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  });
}

module.exports = { sendOTPEmailResend };