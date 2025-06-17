// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const {
  register,
  login,
  logout,
  refreshTokens,
} = require("../controllers/auth");
const { getUser } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", getUser, login);
router.post("/refresh-token", refreshTokens);
router.post("/logout", logout);

module.exports = router;
