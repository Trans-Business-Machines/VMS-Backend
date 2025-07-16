// Import External modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Import the internal modules
const Users = require("../../models/users");
const OTP = require("../../models/otps")
const { CustomError } = require("../../utils");
const {
  jwtAccessTokenOpts,
  refreshTokenCookieOpts,
} = require("../../constants");
const { sendEmail, sendEmailToAdmin, sendOTP } = require("../../utils/mailService");
const { generateOTP } = require("../../utils/services")

// Load .env variables
dotenv.config();

// Get the token secret keys
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Route handlers
async function register(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin"].includes(user.role)) {
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
    /* try {
      await sendEmail(user, password);
      emailSent = true;
    } catch (error) {
      next(error);
    } */

    // send the response back to the client
    return res.status(201).json({
      success: true,
      message: `User created successfully and ${emailSent ? "credentials sent" : "credentials not sent."
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
      { userId: decoded.userId, role: decoded.role },
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

async function contactAdmin(req, res, next) {
  const body = req.body

  try {
    let message = "Could not send email"
    const result = await sendEmailToAdmin(body)

    if (result) {
      message = "Email was successfully sent"
    }

    res.json({
      success: true,
      message
    })

  } catch (error) {
    next(error)
  }

}

async function forgotPassword(req, res, next) {
  // get the user from DB
  const { email = "" } = req.body

  if (!email) {
    return next(new CustomError("You need to provide an email address", 400))
  }

  // Get user by email
  const user = await Users.get({ email }, { includePassword: false })

  // if  user generate OTP and share
  if (user) {
    // Generate OTP
    const otp = generateOTP();
    try {
      // store OTP in DB
      const success = await OTP.storeOTP(otp, user.email)

      if (!success) {
        throw new CustomError("Could not save OTP", 500);
      }

      // send email to user
      await sendOTP(otp, user.email);

    }
    catch (error) {
      throw error
    }
  }

  // send a generic response
  res.json({
    message: "A reset code has been sent to you email, If you don't see it, double-check the address you entered and try again."
  })

}

async function verifyOneTimePassCode(req, res, next) {
  const { otp, email } = req.body;

  if (!email || !otp) {
    return next(new CustomError("You must provide an email and the OTP code.", 400))
  }

  const user = await Users.get({ email })

  try {
    const token = await OTP.createResetToken(otp, { email: user.email, userId: user._id });

    return res.json({
      resetToken: token
    })

  } catch (error) {
    throw error
  }
}

module.exports = {
  refreshTokens,
  register,
  login,
  contactAdmin,
  logout,
  verifyOneTimePassCode,
  forgotPassword
};
