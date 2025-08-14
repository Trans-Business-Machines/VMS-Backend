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
  getMyAvailabilty,
  deleteMyAvailability,
  getHostsWithSchedules,
} = require("../controllers/users");

router.get("/", authenticate, getUsers);
router.get("/roles", authenticate, getRoles);
router.get("/hosts-with-schedules", authenticate, getHostsWithSchedules);
router.get("/:id", authenticate, getOneUser);

router.get("/schedule/:hostId", authenticate, getMyAvailabilty);
router.post("/schedule/:hostId", authenticate, setAvailability);
router.patch("/schedule/:hostId/:scheduleId", authenticate, updateAvailability);
router.delete("/schedule/:hostId/:scheduleId", authenticate, deleteMyAvailability);


router.delete("/:id", authenticate, deleteUser);
router.patch("/:id", authenticate, checkPasswordValidity, updateUser);

module.exports = router;
