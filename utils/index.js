// Custom Error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {}
class CustomError extends AppError {}

// External modules imports
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

const MAIL_USER = process.env.MAIL_USER;
const MAIL_PASS = process.env.MAIL_PASS;

// Initalize a nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

// utility function to send email
async function sendEmail(user, password) {
  const mailOptions = {
    from: MAIL_USER,
    to: user.email.trim(),
    subject: "your new account details.",
    html: `<body style="margin: 0; padding: 2rem; background: linear-gradient(to right, #1D528E, #65DFBF); font-family: Arial, sans-serif; color: #ffffff;">
  <div style="background-color: #ffffff; color: #1D528E; border-radius: 10px; padding: 2rem; max-width: 600px; margin: auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);">
    <h1 style="font-size: 1.8rem; margin-bottom: 1rem;">
    Welcome to Visitor Management System (VMS) 🎉 
    </h1>
    <p style="font-size: 1rem; margin-bottom: 1rem;">Hello <strong style="font-weight: bold;">${
      user.firstname
    }</strong>,</p>
    <p style="font-size: 1rem; margin-bottom: 1rem;">Your account has been <strong>successfully created</strong> by our admin.</p>
    <p style="font-size: 1rem; margin-bottom: 1rem;">
    Your role is ${user.role === "admin" ? "an admin" : `a ${user.role}`}.</p>
    <p style="font-size: 1rem; margin-bottom: 1rem;">You can log in using the following credentials:</p>
    <ul style="font-size: 1rem; margin-bottom: 1rem; list-style-type: none; padding-left: 0;">
      <li><strong>Email:</strong> ${user.email}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>Or</p>
     <ul style="font-size: 1rem; margin-bottom: 1rem; list-style-type: none; padding-left: 0;">
      <li><strong>Phone:</strong> ${user.phone}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p style="font-size: 1rem; margin-bottom: 1.5rem;">
     <b>For security reasons, please log in and update your password as soon as possible.</b>
    </p>
  </div>
</body>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw new CustomError(err ? err.message : "Failed to send email", 500);
  }
}

// This object defines the various purposes for which a visit can be made.
// Add other purposes as needed.
// Each purpose is represented as a key-value pair, where the key is a constant
const VisitPurpose = {
  BUSINESS_MEETING: "business meeting",
  JOB_INTERVIEW: "job interview",
  CLIENT_CONSULTATION: "client consultation",
  VENDOR_DELIVERY_COURIER: "vendor delivery",
  MAINTENANCE_REPAIR: "maintenance",
  IT_SUPPORT: "it support",
  TRAINING_WORKSHOP: "training workshop",
  OFFICE_TOUR: "office tour",
  INSPECTION_AUDIT: "inspection audit",
  EXECUTIVE_VISIT: "executive visit",
  NETWORKING_EVENT: "networking event",
  HR_APPOINTMENT: "hr appointment",
  LEGAL_COMPLIANCE_MEETING: "legal compliance meeting",
  FOLLOW_UP: "follow up",
};

// This array contains all the visit purposes defined in the VisitPurpose object.
const visitPurposes = [
  VisitPurpose.BUSINESS_MEETING,
  VisitPurpose.JOB_INTERVIEW,
  VisitPurpose.CLIENT_CONSULTATION,
  VisitPurpose.VENDOR_DELIVERY_COURIER,
  VisitPurpose.MAINTENANCE_REPAIR,
  VisitPurpose.IT_SUPPORT,
  VisitPurpose.TRAINING_WORKSHOP,
  VisitPurpose.OFFICE_TOUR,
  VisitPurpose.INSPECTION_AUDIT,
  VisitPurpose.EXECUTIVE_VISIT,
  VisitPurpose.NETWORKING_EVENT,
  VisitPurpose.HR_APPOINTMENT,
  VisitPurpose.LEGAL_COMPLIANCE_MEETING,
  VisitPurpose.FOLLOW_UP,
];

module.exports = {
  AuthError,
  CustomError,
  sendEmail,
  VisitPurpose,
  visitPurposes,
};
