const crypto = require("node:crypto")
const { isAfter, isBefore } = require("date-fns");
const { ScheduleError, CustomError } = require("./");

async function isHostAvailable(visitorData, getHostAvailabilty) {
  const schedules = await getHostAvailabilty(visitorData.host);

  // if the length is 0 or the schedulles array is null - return no availability set
  if (schedules.length === 0 || !schedules) {
    // throw an error - no availability set
    throw new CustomError("No schedule set for the selected host.")
  }

  // parse the time_in 
  const timeIn = new Date(visitorData.time_in)

  for (let i = 0; i < schedules.length; i++) {
    const current = schedules[i]
    const nextSchedule = schedules[i + 1]

    const currentStart = new Date(current.start_date)
    const currentEnd = new Date(current.end_date)

    if (isBefore(timeIn, currentStart)) {
      // throw an error  - return  currentStart time in message
      throw new ScheduleError("Host is unavailable", 500, { availableAt: current.start_date })
    }

    if (isAfter(timeIn, currentEnd)) {
      if (nextSchedule) {
        throw new ScheduleError("Host is unavailable", 500, { availableAt: nextSchedule.start_date });
      } else {
        throw new CustomError("No further availability set.")
      }
    }

    if (!isBefore(timeIn, currentStart) && !isAfter(timeIn, currentEnd)) {
      return true;
    }
  }
  return false
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

function capitalize(string) {
  let strArr = string.split(" ");

  strArr = strArr.map((item) => {
    let newItem = "";
    if (item.length === 2 && item !== "up") {
      newItem = item.toUpperCase();
    } else {
      newItem = item[0].substring(0).toUpperCase() + item.substring(1);
    }
    return newItem;
  });

  return strArr.join(" ");
}

module.exports = { isHostAvailable, validateSubscription, generateOTP, capitalize };
