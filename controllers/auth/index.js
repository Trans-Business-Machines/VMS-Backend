// Import the Users model
const Users = require("../../models/users");

async function register(req, res, next) {
  const fields = req.body;
  try {
    const { accessToken, refreshToken, ...user } = await Users.createAccount(
      fields
    );

    // set the refresh token in a httpOnly cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    // send the response back to the client
    return res.status(201).json({
      success: true,
      message: "User created successful",
      accessToken,
      user: {...user}
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
};
