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

    if (!result) {
      throw new CustomError("Check in failed!", 500);
    }

    return {
      success: true,
      message: "Check in was successful",
    };
  } catch (error) {
    throw error;
  }
}

async function remove(visitId) {
  try {
    const result = await Visit.deleteOne({ _id: visitId });

    if (result.deletedCount === 0) {
      throw new CustomError("Visit not found or is already deleted!", 404);
    }

    return {
      success: true,
      message: "Visit has been successfully deleted.",
    };
  } catch (error) {
    throw error;
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
  remove,
};
