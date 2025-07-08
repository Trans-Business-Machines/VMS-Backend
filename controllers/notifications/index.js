const subscription = require("../../models/subscription");
const { CustomError } = require("../../utils/index");

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
    const existing = await subscription.get({
      endpoint,
      user: user.userId,
    });

    if (existing) {
      // update the subscription keys if needed
      existing.keys = keys;
      await existing.save();
    } else {
      // create a new subscription object if none exist
      await subscription.newSubscription({ user: user.userId, endpoint, keys });
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

module.exports = {
  subscribeToNotifications,
};
