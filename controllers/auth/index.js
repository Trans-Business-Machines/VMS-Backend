// Import the Users model
const Users = require("../../models/users");

async function register(req, res, next) {
  const fields = req.body;
  try {
    const result = await Users.createAccount(fields);

    // set the refresh token in a httpOnly cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    // send the response back to the client
    return res.status(201).json({
      success: true,
      message: "User created successful",
      accessToken: result.accessToken,
      user: result.user,
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

    // TODO: include secure true in cookie options
    // set the refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 604800,
    });

    res.status(200).json({
      accessToken,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
