const express = require("express");
const router = express.Router();

// Import internal modules
const { authenticate } = require("../middleware/auth");
const {
  createVisit,
  checkOut,
  getVisits,
  deleteVisit,
} = require("../controllers/visits/");

router.get("/", authenticate, getVisits);
router.post("/new", authenticate, createVisit);
router.patch("/check-out/:visitId", authenticate, checkOut);
router.delete("/:visitId", authenticate, deleteVisit);

module.exports = router;
