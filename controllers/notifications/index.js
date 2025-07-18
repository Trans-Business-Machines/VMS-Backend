// Internal module imports
const Subscription = require("../../models/subscription");
const Notifications = require("../../models/notifications");
const { CustomError, AuthError } = require("../../utils/index");

/* ------------------ Notification route handlers/controlers ------------------ */
async function subscribeToNotifications(req, res, next) {
  // Extract the data and user object
  const { endpoint, keys } = req.body;
  const user = req.user;

  // Validate who can subscribe to notifications
  if (!["host", "receptionist"].includes(user.role)) {
    return next(
      new CustomError(
        "Forbidden, only hosts and receptionists can subscribe to notifications",
        403
      )
    );
  }

  // Validate the inputs
  if (!endpoint || !keys.auth || !keys?.p256dh) {
    return next(new CustomError("Invalid subscription object", 400));
  }

  try {
    const existing = await Subscription.get({
      endpoint,
      user: user.userId,
    });

    if (existing) {
      // update the subscription keys if needed
      existing.keys = keys;
      await existing.save();
    } else {
      // create a new subscription object if none exist
      await Subscription.newSubscription({ user: user.userId, endpoint, keys });
    }

    // respont back to the client
    res.status(201).json({
      success: true,
      message: "Subscription saved successfully.",
    });
  } catch (error) {
    next(error);
  }
}

async function getNotifications(req, res, next) {
  const user = req.user;
  const page = Number(req.query.page) || 1;
  const type = req.query.type || "unread";

  if (!["host", "receptionist"].includes(user.role)) {
    return next(
      new AuthError("Forbidden, you are not allowed to view notifications", 403)
    );
  }

  const filter = { recipient: user.userId };
  const options = { limit: 6, page };

  if (type === "unread") {
    filter.isRead = false;
  }

  try {
    const result = await Notifications.list(filter, options);

    res.json({ result });
  } catch (error) {
    return next(error);
  }
}

async function markOneAsRead(req, res, next) {
  const user = req.user;
  const updates = req.body;
  const id = req.params.id;

  // Ensure that only hosts or receptionists can update notifications
  if (["host", "receptionist"].includes(user.role)) {
    // Ensure that only hosts themselves can update their notifications
    if (user.userId !== updates.userId) {
      return new AuthError("You can't update another host's notification", 403);
    }

    // try to update the notification
    try {
      const success = await Notifications.updateOneAsRead({
        _id: id,
        recipient: user.userId,
      });

      if (!success) {
        throw CustomError("Could not update notification as read", 500);
      }
      return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
      });
    } catch (error) {
      return next(error);
    }
  } else {
    // throw an error
    return next(
      new AuthError(
        "Forbidden, Only a host or a receptionist can update notifications.",
        403
      )
    );
  }
}

async function markAllAsRead(req, res, next) {
  const user = req.user;
  const updates = req.body;

  // Ensure that only hosts and receptionist can update notifications
  if (!["host", "receptionist"].includes(user.role)) {
    // Ensure that only user themselves can update their own notification
    if (user.userId !== updates.userId) {
      return next(
        new AuthError(
          "Forbidden, you can't update anyone else's notifications",
          403
        )
      );
    }

    // try to update notifications tied to the user
    try {
      const success = await Notifications.updateAllAsRead({
        recipient: user.userId,
        isRead: false,
      });

      if (!success) {
        throw new CustomError("Could not mark all notifications as read");
      }
      return res.json({
        success: true,
        message: "Notifications updated.",
      });
    } catch (error) {
      return next(error);
    }
  } else {
    // throw error if not
    return next(
      new AuthError(
        "Forbidden, only a hosts or a receptionist can update notifications",
        403
      )
    );
  }
}

module.exports = {
  subscribeToNotifications,
  getNotifications,
  markOneAsRead,
  markAllAsRead,
};
