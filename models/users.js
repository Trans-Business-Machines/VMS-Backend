// Import external modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Import internal modules
const { CustomError } = require("../utils/");
const {
  jwtAccessTokenOpts,
  jwtRefreshTokenOpts,
  SALT_ROUNDS,
} = require("../constants");

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
  try {
    //Try to insert user to DB
    // Create an in memory user object first
    const newUser = new Users(fields);

    // Hash the password of the new in memory user
    newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS);

    // Write the in memory user to the database
    await newUser.save();

    return {
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
    throw error;
  }
}

async function createTokens(user, existingToken) {
  // create an access token
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_TOKEN_SECRET,
    jwtAccessTokenOpts
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
        jwtRefreshTokenOpts
      );
    }
  } else {
    // if it does not exist,  create one
    refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_REFRESH_SECRET,
      jwtRefreshTokenOpts
    );
  }

  // return a result object
  return {
    accessToken,
    refreshToken,
  };
}

async function get(params) {
  try {
    const user = Users.findOne(params);
    return user;
  } catch (error) {
    throw new CustomError("User not found!", 404);
  }
}

// Export the user methods
module.exports = {
  createAccount,
  createTokens,
  get,
};
