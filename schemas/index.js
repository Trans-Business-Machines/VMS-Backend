const mongoose = require("mongoose");
const { createId } = require("@paralleldrive/cuid2");
const { isAlpha, isEmail, isNumeric } = require("validator");

// Import internal modules
const { VisitPurpose, visitPurposes } = require("../utils");

/* ----------------- user schema ----------------- */
const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: createId },
    firstname: {
      type: String,
      required: true,
      validate: {
        validator: isAlpha,
        message: (props) => `${props.value} should only contain alphabets`,
      },
    },
    lastname: {
      type: String,
      required: true,
      validate: {
        validator: isAlpha,
        message: (props) => `${props.value} should only contain alphabets`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: isEmail,
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      maxLength: 15,
      minLength: 10,
      validate: {
        validator: isNumeric,
        message: (props) => `${props.value} should only contain numbers`,
      },
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 128,
    },
    role: {
      type: String,
      lowercase: true,
      enum: ["super admin", "admin", "host", "receptionist", "soldier"],
      default: "soldier",
    },
  },
  { timestamps: true }
);

/* ----------------- visit schema ----------------- */
const visitSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  host: {
    type: String,
    ref: "Users",
    index: true,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
    validate: {
      validator: isAlpha,
      message: (props) => `${props.value} should only contain alphabets`,
    },
  },
  lastname: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
    validate: {
      validator: isAlpha,
      message: (props) => `${props.value} should only contain alphabets`,
    },
  },
  national_id: {
    type: String,
    required: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    maxLength: 15,
    minLength: 10,
    validate: {
      validator: isNumeric,
      message: (props) => `${props.value} should only contain numbers`,
    },
  },
  status: {
    type: String,
    required: true,
    lowercase: true,
    enum: ["checked-in", "checked-out"],
    default: "checked-in",
  },
  purpose: {
    type: String,
    required: true,
    lowercase: true,
    enum: visitPurposes,
    default: VisitPurpose.BUSINESS_MEETING,
  },
  visit_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  time_in: {
    type: Date,
    required: true,
    default: Date.now,
  },
  time_out: {
    type: Date,
  },
  checkin_officer: {
    type: String,
    ref: "Users",
    index: true,
    required: true,
  },
});

/* ----------------- schedule schema ----------------- */
const scheduleSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  host: {
    type: String,
    ref: "Users",
    required: true,
    index: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
});

/* ----------------- notification schema ----------------- */
const notificationSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  recepient: {
    type: String,
    ref: "Users",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 30,
  },
  message: {
    type: String,
    required: true,
    minLength: 10,
    maxLength: 100,
  },
  isRead: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

/* ----------------- notification schema ----------------- */
const subscriptionSchema = new mongoose.Schema({
  _id: { type: String, default: createId },
  user: {
    type: String,
    index: true,
    ref: "Users",
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: String,
    auth: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* ----------------- Exports  ----------------- */
module.exports = {
  userSchema,
  visitSchema,
  scheduleSchema,
  notificationSchema,
  subscriptionSchema,
};
