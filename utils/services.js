const crypto = require("node:crypto")
const { isAfter, isBefore, parseISO } = require("date-fns");
const { ScheduleError, CustomError } = require("./");

async function isHostAvailable(visitorData, getHostAvailabilty) {
  const schedules = await getHostAvailabilty(visitorData.host);

  // if the length is 0 or the schedulles array is null - return no availability set
  if (schedules.length === 0 || !schedules) {
    // throw an error - no availability set
    throw new CustomError("No schedule set for the selected host.")
  }

  // parse the time_in into a date object
  const timeIn = parseISO(visitorData.time_in)

  // check if a time_in falls within an availability slot
  for (const schedule of schedules) {
    const start = schedule.start_date
    const end = schedule.end_date

    // if time in is not before start and not after end then host is available
    if (!isBefore(timeIn, start) && !isAfter(timeIn, end)) {
      return true
    }
  }

  // if no matching slot, find the next upcomming availability
  const futureAvailabilities = schedules.filter(s => isAfter(s.start_date, timeIn))

  if (futureAvailabilities.length > 0) {
    throw new ScheduleError("Host is unavailable", 500, {
      availableAt: futureAvailabilities[0].start_date
    })
  } else {
    throw new CustomError("No further availability set")
  }

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
