const nodemailer = require('nodemailer');

// Configure transporter (Gmail SMTP for demo; use env vars in production)

// Use more robust transporter config and log connection issues
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code for Registration',
    text: `Your OTP code is: ${otp}. It is valid for 10 minutes.`,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail };