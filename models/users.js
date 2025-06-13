// Import external modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Import internal modules
const { CustomError } = require("../utils/");

// LOAD .env variables
dotenv.config();

// Get the JWT secret from environment variables
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Import the user schema from schemas directory
const { userSchema } = require("../schemas");

// create the users model
const Users = mongoose.model("Users", userSchema);

/* ------------------------- User Model Functions  -------------------------*/
async function createAccount(fields) {
  // check if the user already exists
  const existingUser = await Users.findOne({
    email: fields.email,
  });

  if (existingUser) {
    // Return error if user already exists.
    throw new CustomError("Email already in use!", 400);
  }

  // Hash the password
  fields.password = await bcrypt.hash(fields.password, 10);

  try {
    // Insert user to DB
    const newUser = await Users.create(fields);

    // create access and refresh tokens
    const accessToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_TOKEN_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      JWT_REFRESH_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      }
    );

    return {
      accessToken,
      refreshToken,
      user: {
        userId: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// Export the user methods
module.exports = {
  createAccount,
};
