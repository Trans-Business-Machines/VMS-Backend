const crypto = require("node:crypto")
const { isAfter, isBefore, format } = require("date-fns");
const { CustomError } = require("./");

async function isHostAvailable(visitorData, currentDate, getHostAvailabilty) {
  const schedule = await getHostAvailabilty(visitorData.host);

  if (!schedule) {
    throw new CustomError(
      "This host has no schedule yet. Please contact the reception or select another host.",
      400
    );
  }

  const start = new Date(schedule.start_date);
  const end = new Date(schedule.end_date);

  if (isBefore(currentDate, start)) {
    throw new CustomError(
      `The host is not yet available. Their availability starts on ${format(
        start,
        "PPP"
      )}. Please choose another host.`,
      400
    );
  }

  if (isAfter(currentDate, end)) {
    throw new CustomError(
      `The host's availability ended on ${format(
        end,
        "PPP"
      )}. Please choose another host.`,
      400
    );
  }

  return true;
}

function validateSubscription(subscription) {
  if (!subscription) {
    throw new CustomError("Subscription is null or undefined", 400);
  }

  if (!subscription.endpoint) {
    throw new CustomError("Subscription missing endpoint", 400);
  }

  if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    throw CustomError("Subscription missing required keys", 400);
  }

  return true;
}

function generateOTP() {
  let randomOtp = crypto.randomInt(100000, 999999)
  randomOtp = randomOtp.toString()
  return randomOtp;
}


module.exports = { isHostAvailable, validateSubscription, generateOTP };
