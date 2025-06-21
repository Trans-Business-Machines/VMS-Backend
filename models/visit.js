// Import external modules
const mongoose = require("mongoose");

// Import internal modules
const { visitSchema } = require("../schemas");
const { CustomError } = require("../utils/");

const Visit = mongoose.model("Visit", visitSchema);

/*------------------------ Visit model methods ------------------------ */

async function checkIn(visitorData) {
  try {
    let result = await Visit.create(visitorData);

    result = await getVisit({ _id: result._id });

    return result;
  } catch (error) {
    throw error;
  }
}

async function getVisit(filter) {
  try {
    const visit = await Visit.findOne(filter, "-__v")
      .populate({ path: "host", select: "firstname lastname" })
      .populate({ path: "checkin_officer", select: "firstname lastname" })
      .exec();

    if (!visit) {
      throw new CustomError("Not found!", 404);
    }

    return visit;
  } catch (err) {
    throw err;
  }
}

async function signOut(visitId, updates) {
  try {
    const result = await Visit.findOneAndUpdate(
      { _id: visitId },
      { time_out: Date.now(), ...updates },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("_id status  visit_date time_in time_out")
      .select("-__v")
      .lean();

    return result;
  } catch (error) {
    throw error;
  }
}

/*------------------------  Export visit model methods ------------------------ */
module.exports = {
  checkIn,
  signOut,
};
