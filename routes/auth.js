// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const { register, login } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);

module.exports = router;
