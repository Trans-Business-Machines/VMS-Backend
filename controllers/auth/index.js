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
  const fields = req.body;
  const existingToken = req.cookies.refreshToken;

  const filter = fields.email
    ? { email: fields.email }
    : { phone: fields.phone };

  // Get the user object
  const user =  await Users.get(filter);

  // login with email
  try {
    const { refreshToken, ...result } = await Users.loginWithEmailOrPhone(
      fields,
      user,
      existingToken
    );

    // set the refresh token in cookie
    res.cookie("refreshToken", refreshToken, { httpOnly: true });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
