// Import external modules
const mongoose = require("mongoose");
const { endOfDay, startOfDay } = require("date-fns");

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
        runValidators: true,
      }
    );

    return result;
  } catch (error) {
    throw error;
  }
}

async function list(opts = {}) {
  let filter = {};

  if (opts.host) {
    filter.host = opts.host;
  }

  if (opts.purpose) {
    filter.purpose = opts.purpose;
  }

  if (opts.visit_day) {
    const day = new Date(opts.visit_day);
    filter.visit_date = {
      $gte: startOfDay(day),
      $lte: endOfDay(day),
    };
  }

  const totalVisits = await Visit.countDocuments();
  const totalPages = Math.ceil(totalVisits / opts.limit);

  const hasNext = opts.currentPage < totalPages;
  const hasPrev = opts.currentPage > 1;

  try {
    const logs = await Visit.find(filter, "-__v")
      .sort({ time_in: -1 })
      .skip(opts.offset)
      .limit(opts.limit)
      .populate({ path: "host", select: "firstname lastname " })
      .populate({ path: "checkin_officer", select: "firstname lastname " })
      .lean();

    return {
      hasNext,
      hasPrev,
      visits: logs,
      totalPages,
      currentPage: opts.currentPage,
    };
  } catch (error) {
    throw error;
  }
}

async function getStatistics() {
  try {
    const today = new Date();
    const filter = { $gte: startOfDay(today), $lte: endOfDay(today) };

    const visitCount = await Visit.countDocuments({
      visit_date: filter,
    });

    const activeVisitors = await Visit.countDocuments({
      status: "checked-in",
      time_in: filter,
    });

    const checkedOutVisitors = await Visit.countDocuments({
      status: "checked-out",
      time_in: filter,
    });

    return {
      visitCount,
      activeVisitors,
      checkedOutVisitors,
    };
  } catch (error) {
    throw error;
  }
}

async function getTodaysVisitorStats(page) {
  const limit = 10;
  const offset = Math.max((page - 1) * limit, 0);
  const today = new Date();
  const filter = { $gte: startOfDay(today), $lte: endOfDay(today) };

  try {
    const todaysCount = await Visit.countDocuments({
      visit_date: filter,
    });

    const totalPages = Math.ceil(todaysCount / limit);

    const visits = await Visit.find({
      visit_date: filter,
    })
      .sort({ time_in: -1 })
      .skip(offset)
      .limit(10)
      .populate({
        path: "host",
        select: "firstname lastname",
      })
      .populate({
        path: "checkin_officer",
        select: "firstname lastname",
      })
      .select("firstname lastname national_id time_in time_out status")
      .lean();

    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      hasNext,
      hasPrev,
      visits,
      currentPage: page,
    };
  } catch (error) {
    throw error;
  }
}

async function getHostLogs(filter = {}, opts = {}) {
  try {
    const { limit, offset, page } = opts

    const totalLogs = await Visit.countDocuments(filter)
    const totalPages = Math.ceil(totalLogs / limit)

    const hostLogs = await Visit.
      find(filter)
      .sort({ time_in: -1 })
      .skip(offset)
      .limit(limit)
      .populate({
        path: "checkin_officer",
        select: "firstname lastname"
      })
      .select("-host -__v")
      .lean()

    const hasNext = page < totalPages;
    const hasPrev = page > 1

    return {
      hasNext,
      hasPrev,
      hostLogs,
      totalPages,
      current: page
    }
  } catch (error) {
    throw error
  }

}

async function getMonthlyData(monthStart, monthEnd) {
  try {
    // count total visits
    const totalVisits = await Visit.countDocuments({
      visit_date: { $gte: monthStart, $lte: monthEnd }
    })

    // Get the top 5 reasons for visit 
    const topPurposes = await Visit.aggregate([
      {
        $match: {
          visit_date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ])


    // Top 3 hosts with the most visits
    const topHosts = await Visit.aggregate([
      {
        $match: {
          visit_date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: "$host", // Group by host ID
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: "users",         // Name of the Users collection
          localField: "_id",     // host ObjectId
          foreignField: "_id",   // match against _id in users
          as: "hostInfo"
        }
      },
      {
        $unwind: "$hostInfo"
      },
      {
        $project: {
          count: 1,
          firstname: "$hostInfo.firstname",
          lastname: "$hostInfo.lastname",
          email: "$hostInfo.email"
        }
      }
    ]);


    return {
      totalVisits,
      topPurposes,
      topHosts
    }

  } catch (error) {
    throw error
  }
}

/*------------------------  Export visit model methods ------------------------ */
module.exports = {
  checkIn,
  signOut,
  remove,
  list,
  getStatistics,
  getHostLogs,
  getTodaysVisitorStats,
  getMonthlyData
};
