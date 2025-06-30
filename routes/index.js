// Import external modules
const express = require("express");
const router = express.Router();

// Import internal modules
const { getHosts } = require("../controllers/users/");
const { getPurposes, getStats } = require("../controllers/visits");
const { authenticate } = require("../middleware/auth");

router.get("/hosts", authenticate, getHosts);
router.get("/purposes", authenticate, getPurposes);
router.get("/stats",authenticate, getStats);

module.exports = router;
