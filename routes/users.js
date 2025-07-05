// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const { authenticate, checkPasswordValidity } = require("../middleware/auth");
const {
  getUsers,
  getRoles,
  getOneUser,
  deleteUser,
  updateUser,
  setAvailability,
  updateAvailability,
} = require("../controllers/users");

router.get("/", authenticate, getUsers);
router.get("/roles", authenticate, getRoles);
router.get("/:id", authenticate, getOneUser);

router.post("/schedule/:hostId", authenticate, setAvailability);
router.patch("/schedule/:hostId", authenticate, updateAvailability);

router.delete("/:id", authenticate, deleteUser);
router.patch("/:id", authenticate, checkPasswordValidity, updateUser);

module.exports = router;
