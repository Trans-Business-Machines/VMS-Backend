// Import External modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Import the internal modules
const Users = require("../../models/users");
const { CustomError, sendEmail } = require("../../utils");
const {
  jwtAccessTokenOpts,
  refreshTokenCookieOpts,
} = require("../../constants");

// Load .env variables
dotenv.config();

// Get the token secret keys
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Route handlers
async function register(req, res, next) {
  const user = req.user;

  if (user.role !== "admin") {
    return next(
      new CustomError("Forbidden, only admin can create users.", 403)
    );
  }

  const fields = req.body;
  const password = fields.password;

  try {
    const { user } = await Users.createAccount(fields);
    let emailSent = false;

    //try to send email to the  client
    try {
      await sendEmail(user, password);
      emailSent = true;
    } catch (error) {
      next(error);
    }

    // send the response back to the client
    return res.status(201).json({
      success: true,
      message: `User created successfully and ${
        emailSent ? "credentials sent" : "credentials not sent."
      } `,
      user,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const user = req.user;
  const existingToken = req.cookies.refreshToken;

  // Try to create new tokens
  try {
    const { refreshToken, accessToken } = await Users.createTokens(
      user,
      existingToken
    );

    // If a new refresh token is created, set it in the cookie
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOpts);

    res.status(200).json({
      accessToken,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}

function refreshTokens(req, res, next) {
  // get the refresh token from req cookies
  const token = req.cookies["refreshToken"];

  // if no refresh token is present send a 400 bad request error
  if (!token) {
    return next(new CustomError("No refresh token provided.", 400));
  }

  // try to verify the refresh token
  try {
    // if valid, use the decoded user info to create a new access token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded._id, role: decoded.role },
      JWT_TOKEN_SECRET,
      jwtAccessTokenOpts
    );

    // send the new access token to the client
    res.status(200).json({ accessToken, success: true });
  } catch (error) {
    console.error(error);
    // otherwise send a 400 Invalid refresh token error
    next(new CustomError("Invalid or expired refresh token.", 400));
  }
}

function logout(req, res) {
  // set the refresh token cookie's max age to 0 (expired date)
  res.clearCookie("refreshToken", refreshTokenCookieOpts);

  // send back response
  res.status(200).json({
    success: true,
    message: "Log out successful",
  });
}

module.exports = {
  refreshTokens,
  register,
  login,
  logout,
};
