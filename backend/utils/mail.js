// Use Resend transactional email API for OTP delivery
const { sendOTPEmailResend } = require('./resend');

async function sendOTPEmail(to, otp) {
  return sendOTPEmailResend(to, otp);
}

module.exports = { sendOTPEmail };