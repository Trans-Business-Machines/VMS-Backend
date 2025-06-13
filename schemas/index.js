const mongoose = require("mongoose");
const { createId } = require("@paralleldrive/cuid2");
const { isAlpha, isEmail, isNumeric } = require("validator");

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
      enum: ["admin", "host", "soldier"],
      default: "soldier",
    },
  },
  { timestamps: true }
);

module.exports = {
  userSchema,
};
