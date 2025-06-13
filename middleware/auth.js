const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { CustomError } = require("../utils/index");

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
    return next(new CustomError("No access token provided.", 401));
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

module.exports = {
  authenticate,
};
