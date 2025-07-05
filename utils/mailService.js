const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const { CustomError } = require("./");

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

async function sendEmail(user, password) {
  const mailOptions = {
    from: MAIL_USER,
    to: user.email.trim(),
    subject: "Your New Account Details",
    html: `
      <body style="padding: 2rem; font-family: Arial, sans-serif;">
        <div style="background: #fff; color: #1D528E; padding: 1.5rem; border-radius: 10px;">
          <h2>Welcome to Visitor Management System (VMS) 🎉</h2>
          <p>Hello <strong>${user.firstname}</strong>, your account has been created.</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>You can log in using:</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Phone:</strong> ${user.phone}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Please change your password upon login for security.</p>
        </div>
      </body>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new CustomError(error.message || "Failed to send email", 500);
  }
}

module.exports = { sendEmail };
