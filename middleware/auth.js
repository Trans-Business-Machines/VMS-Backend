const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");
const { AuthError, CustomError } = require("../utils/index");

// Load the environment variables
dotenv.config();

// Get the JWT secret from environment variables
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

// Authenticate middleware to verify user identity
function authenticate(req, res, next) {
  // Get the access token from authorization header
  let accessToken = req.headers.authorization;
  accessToken = accessToken.replace(/^bearer\s*/i, "");

  if (!accessToken) {
    return next(new AuthError("No access token provided.", 401));
  }

  // Verify token signature
  try {
    // decode the jwt payload
    const decoded = jwt.verify(accessToken, JWT_TOKEN_SECRET);

    // attach the payload to request object
    req.user = decoded;

    // Proceed to the next route handler
    next();
  } catch (error) {
    res.status(400).json({
      error: {
        message: error.message,
      },
    });
  }
}

async function getUser(req, res, next) {
  // Get the user fields from req object
  const fields = req.body;

  // Get the field (email/phone) used to query db
  const filter = fields.email
    ? { email: fields.email }
    : { phone: fields.phone };

  // Get the user object from DB
  const user = await Users.get(filter);

  // if no user is found throw not found error
  if (!user) {
    throw next(new CustomError("User not found!", 404));
  }

  // check if password match
  const passwordMatch = await bcrypt.compare(fields.password, user.password);

  if (!passwordMatch) {
    // if not throw error
    throw next(new AuthError("Incorrect password!", 400));
  }

  // if they match attach user object to req
  req.user = user;

  // call next
  next();
}

module.exports = {
  authenticate,
  getUser,
};
