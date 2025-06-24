// Import external modules
const express = require("express");
const router = express.Router();

// Internal module methods
const { authenticate } = require("../middleware/auth");
const {
  getUsers,
  getRoles,
  getOneUser,
  deleteUser,
  updateUser,
} = require("../controllers/users");

router.get("/", authenticate, getUsers);
router.get("/roles", authenticate, getRoles);
router.get("/:id", authenticate, getOneUser);

router.delete("/:id", authenticate, deleteUser);
router.patch("/:id", authenticate, updateUser);

module.exports = router;
