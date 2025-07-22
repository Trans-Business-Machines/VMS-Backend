const jwtAccessTokenOpts = { algorithm: "HS256", expiresIn: "1h" };

const jwtRefreshTokenOpts = {
  algorithm: "HS256",
  expiresIn: "1d",
}

const jwtResetTokenOpts = {
  algorithm: "HS256",
  expiresIn: "10min",
};


const refreshTokenCookieOpts = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  maxAge: 24 * 60 * 60 * 1000, // 1day
};

const SALT_ROUNDS = 10;

module.exports = {
  SALT_ROUNDS,
  jwtResetTokenOpts,
  jwtAccessTokenOpts,
  jwtRefreshTokenOpts,
  refreshTokenCookieOpts,
};
