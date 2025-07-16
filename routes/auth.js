// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  verifyOneTimePassCode
} = require("../controllers/auth");
const { getUser, authenticate } = require("../middleware/auth");

router.post("/register", authenticate, register);
router.post("/login", getUser, login);
router.post("/refresh-token", refreshTokens);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp", verifyOneTimePassCode)

module.exports = router;
