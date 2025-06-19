const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

router.get("/new", authenticate, (req, res) => {
  res.json({ success: true, message: "Protected visit created successful" });
});

module.exports = router;
