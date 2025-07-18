// External modules import
const express = require("express");
const router = express.Router();

// Internal modules import
const notifications = require("../controllers/notifications");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, notifications.getNotifications);

router.post("/subscribe", authenticate, notifications.subscribeToNotifications);

router.patch("/:id", authenticate, notifications.markOneAsRead);
router.patch("/read-all", authenticate, notifications.markAllAsRead);

module.exports = router;
