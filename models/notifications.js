// External module imports
const mongoose = require("mongoose");

// Internal module imports
const { notificationSchema } = require("../schemas/index");
const { CustomError } = require("../utils/index");
const { validateSubscription } = require("../utils/services")
const Subscription = require("./subscription");
const webPush = require("../config/notifications");

// create a notification model
const Notification = mongoose.model("notifications", notificationSchema);

/*------------------- Notification model methods ------------------- */
async function createNotification(notification) {
  try {
    const result = await Notification.create(notification);

    if (!result) {
      throw new CustomError("An error occured while creating the notification");
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function notifyHostOnCheckIn(notification) {
  try {
    // Save the notification to the database
    await createNotification(notification);
    console.log("Notification saved to DB...");

    // Destructure the notifiacation object
    const { recipient, title, message } = notification;

    // create push notification payload
    const payload = JSON.stringify({ title, message });

    // Get the host subscription object from DB
    console.log("Getting the host subscription object...");
    const subscription = await Subscription.get({ user: recipient });

    // Validate subscription object
    console.log("Validating subscription object");
    const isValid = validateSubscription(subscription)

    if (isValid) {
      await webPush.sendNotification(subscription, payload)
      console.log("Notification sent")
    }

  } catch (error) {
    throw error;
  }
}

async function list(filter, opts = {}) {
  const { page, limit } = opts;
  const offset = Math.max((page - 1) * limit, 0);
  try {
    const totalNotifications = await Notification.countDocuments(filter);
    const totalPages = Math.ceil(totalNotifications / limit);

    const result = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .select("-__v")
      .lean();

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response = {
      hasPrev,
      hasNext,
      notifications: result,
      currentPage: page,
      totalPages,
    }
    if (filter.isRead === false) {
      response.count = totalNotifications
    }
    return response;
  } catch (error) {
    throw error;
  }
}

async function updateOneAsRead(filter) {
  try {
    const result = await Notification.findOneAndUpdate(
      filter,
      {
        isRead: true,
      },
      {
        runValidators: true,
      }
    );

    return result ? true : false;
  } catch (error) {
    throw error;
  }
}

async function updateAllAsRead(filter) {
  try {
    const success = await Notification.updateMany(filter, { isRead: true });

    return success ? true : false;
  } catch (error) {
    throw error;
  }
}

/*------------------- Exports ------------------- */
module.exports = {
  createNotification,
  list,
  updateOneAsRead,
  updateAllAsRead,
};
