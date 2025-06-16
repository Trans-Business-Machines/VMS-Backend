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
  const existingEmail = await get({ email: fields.email });

  // check if phone already exists
  const existingPhone = await get({ phone: fields.phone });

  if (existingEmail) {
    // Throw error if email already exists.
    throw new CustomError("Email already in use!", 400);
  }

  if (existingPhone) {
    // Throw error if phone number already exists.
    throw new CustomError("Phone number is already in use!", 400);
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

async function get(params) {
  try {
    const user = Users.findOne(params);
    return user;
  } catch (error) {
    throw new CustomError("User not found!", 404);
  }
}

async function createTokens(user, existingToken) {
  // create an access token
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_TOKEN_SECRET,
    { algorithm: "HS256", expiresIn: "1h" }
  );

  // check if a valid refresh token existings if not create another
  let refreshToken = null;

  if (existingToken) {
    // verify signature
    try {
      // if the existing token is valid return it
      const decoded = jwt.verify(existingToken, JWT_REFRESH_SECRET);
      refreshToken = existingToken;
    } catch (err) {
      // if token exists and has expired create a new one
      refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_REFRESH_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "7d",
        }
      );
    }
  } else {
    // if it does not exist,  create one
    refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_REFRESH_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      }
    );
  }

  // return a result object
  return {
    accessToken,
    refreshToken,
  };
}

// Export the user methods
module.exports = {
  createAccount,
  createTokens,
  get,
};
