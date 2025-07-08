// External module imports
const mongoose = require("mongoose");

// Internal module imports
const { subscriptionSchema } = require("../schemas/index");

// create a subscription model
const Subscription = mongoose.model("subscription", subscriptionSchema);

/*---------------- Subscription methods ----------------*/

async function newSubscription(fields) {
  try {
    const subscriptionObj = await Subscription.create(fields);
    return subscriptionObj;
  } catch (error) {
    throw error;
  }
}

async function get(filter) {
  try {
    const subscriptionObj = await Subscription.findOne(filter);
    return subscriptionObj;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  newSubscription,
  get,
};
