// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const { register } = require("../controllers/auth/");

router.post("/register", register);

module.exports = router;
