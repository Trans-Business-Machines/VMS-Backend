// Custom Error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError { }
class CustomError extends AppError { }

class ScheduleError extends AppError {
  constructor(message, statusCode, details = {}) {
    super(message, statusCode)
    this.details = details
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
  ScheduleError,
  VisitPurpose,
  visitPurposes,
};
