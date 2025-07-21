const jwtAccessTokenOpts = { algorithm: "HS256", expiresIn: "1h" };

const jwtRefreshTokenOpts = {
  algorithm: "HS256",
  expiresIn: "1d",
}

const jwtResetTokenOpts = {
  algorithm: "HS256",
  expiresIn: "12min",
};

// TODO: include secure and sameSite options during production
// For now, we are setting httpOnly to true to prevent client-side access`
const refreshTokenCookieOpts = {
  httpOnly: true,
  secure: true,
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
