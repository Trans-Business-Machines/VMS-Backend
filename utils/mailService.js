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
      <body style="margin: 0; padding: 2rem; font-family: Arial, sans-serif; background: linear-gradient(to right, #65DFBF, #1D528E);">
        <div style="background: #fff; color: #1D528E; padding: 1.5rem; border-radius: 10px;">
          <h2>Welcome to Visitor Management System (VMS) 🎉</h2>
          <p>Hello <strong>${user.firstname}</strong>, your account has been created.</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p>You can log in using:</p>
          <ul>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Or</p>
           <ul>
            <li><strong>Email:</strong> ${user.phone}</li>
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

async function sendEmailToAdmin(user) {
  const mailOptions = {
    from: user.email,
    to: MAIL_USER,
    subject: "Account Creation Request",
    html: ` <body style="margin: 0; padding: 2rem; font-family: Arial, sans-serif; background: linear-gradient(to right, #65DFBF, #1D528E);">
  <div style="max-width: 600px; margin: auto; background:#ffffff;  color: #1D528E; padding: 2rem; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15);">
    <h2 style="font-size: 1.8rem; margin-bottom: 1rem;">Account registration request for Visitor Management System (VMS)</h2>
    <p style="font-size: 1.1rem;">Hello Admin,</p>
    <p style="font-size: 1.1rem;">I would like to request for account registration in the system. Below are my details:</p>
    
    <ul style="font-size: 1.05rem; padding-left: 1rem; line-height: 1.6;">
      <li><strong>Firstname:</strong> ${user.firstname}</li>
      <li><strong>Lastname:</strong> ${user.lastname}</li>
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Phone:</strong> ${user.phone}</li>
      <li><strong>Requested Role:</strong> ${user.role}</li>
    </ul>

    <p style="font-size: 1.1rem; margin-top: 1.5rem;">Thank you.</p>
  </div>
</body>
`
  }

  try {
    const response = await transporter.sendMail(mailOptions)
    return response
  } catch (error) {
    throw error
  }
}


async function sendOTP(otp, email) {
  const mailOptions = {
    from: MAIL_USER,
    to: email,
    subject: "Reset Password",
    html: `
      <body style="padding: 2rem; font-family: Arial, sans-serif; background: linear-gradient(to right, #65DFBF, #1D528E);">
  <div style="background: #fff; color: #1D528E; padding: 2rem; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="margin-bottom: 1rem;">Password Reset Request</h2>
    
    <p style="margin-bottom: 1rem;">
      You recently requested to reset your password. Use the One-Time Passcode (OTP) below to complete the process. This code is valid for <strong>15 minutes</strong>.
    </p>
    
    <p style="font-weight: bold; font-size: 2rem; margin: 1rem 0; text-align: center;">
      <strong>${otp}</strong>
    </p>

    <p style="margin-bottom: 1rem;">
      If you did not request this, you can safely ignore this email.
    </p>
  </div>
</body>

    `
  }

  try {
    const response = await transporter.sendMail(mailOptions)
    return response
  } catch (error) {
    throw error
  }

}

module.exports = { sendEmail, sendEmailToAdmin, sendOTP };
