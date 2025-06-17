const jwtAccessTokenOpts = { algorithm: "HS256", expiresIn: "5m" };

const jwtRefreshTokenOpts = {
  algorithm: "HS256",
  expiresIn: "1h",
};

// TODO: include secure and sameSite options during production
// For now, we are setting httpOnly to true to prevent client-side access`
const refreshTokenCookieOpts = {
  httpOnly: true,
  maxAge: 60 * 60 * 1000, // 1 hour
};

const SALT_ROUNDS = 10;

module.exports = {
  SALT_ROUNDS,
  jwtAccessTokenOpts,
  jwtRefreshTokenOpts,
  refreshTokenCookieOpts,
};
