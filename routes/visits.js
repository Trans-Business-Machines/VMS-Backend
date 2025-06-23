const express = require("express");
const router = express.Router();

// Import internal modules
const { authenticate } = require("../middleware/auth");
const {
  createVisit,
  checkOut,
  deleteVisit,
} = require("../controllers/visits/");

router.post("/new", authenticate, createVisit);
router.patch("/check-out/:visitId", authenticate, checkOut);
router.delete("/:visitId", authenticate, deleteVisit);

module.exports = router;
