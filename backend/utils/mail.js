const nodemailer = require('nodemailer');

// Gmail SMTP configuration for local development
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

async function sendNewAssignmentEmail(to, assignment) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to, // Can be an array of emails
    subject: `New Assignment Posted: ${assignment.title}`,
    html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>📚 New Assignment Available</h2>
                <p>Hello Student,</p>
                <p>A new assignment has been posted by your teacher.</p>
                <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px; color: #4338ca;">${assignment.title}</h3>
                    <p style="margin: 0;"><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleDateString()}</p>
                    <p style="margin: 10px 0 0;">${assignment.description.substring(0, 150)}...</p>
                </div>
                <p>Please log in to the portal to view the full details and submit your work.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
            </div>
        `
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTPEmail, sendNewAssignmentEmail };