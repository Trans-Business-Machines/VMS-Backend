const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const Users = require("../models/users");
const { AuthError, CustomError } = require("../utils/index");
const { SALT_ROUNDS } = require("../constants");

// Load the environment variables
dotenv.config();

// Get the JWT secret from environment variables
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;

// Authenticate middleware to verify user identity
function authenticate(req, res, next) {
  // Get the access token from authorization header
  let accessToken = req.headers.authorization;

  if (!accessToken) {
    return next(new AuthError("Access denied, No access token provided!", 400));
  }

  accessToken = accessToken.replace(/^bearer\s*/i, "");

  // Verify token signature
  try {
    // decode the jwt payload
    const decoded = jwt.verify(accessToken, JWT_TOKEN_SECRET);

    // attach the payload to request object
    req.user = decoded;

    // Proceed to the next route handler
    next();
  } catch (error) {
    res.status(401).json({
      error: {
        message: error.message || "Invalid or expired token.",
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
  const user = await Users.get(filter, { includePassword: true });

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

async function checkPasswordValidity(req, res, next) {
  const targetUpdates = req.body;

  if (
    targetUpdates.hasOwnProperty("currentPassword") &&
    targetUpdates.hasOwnProperty("newPassword")
  ) {
    const targetUser = await Users.get(
      { _id: req.user.userId },
      { includePassword: true }
    );

    const { currentPassword, newPassword, ...otherUpdates } = targetUpdates;

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      targetUser.password
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    req.updates = { ...otherUpdates, password: hashedPassword };
    next();
  } else {
    // call the next handler
    req.updates = targetUpdates;
    next();
  }
}

module.exports = {
  authenticate,
  getUser,
  checkPasswordValidity,
};
