const Visit = require("../../models/visit");
const { AuthError, CustomError, visitPurposes } = require("../../utils");

async function createVisit(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    throw new AuthError(
      "Forbidden, only a soldier or an admin can create new visits.",
      403
    );
  }

  const visitor = req.body;

  try {
    const result = await Visit.checkIn(visitor);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

async function checkOut(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    throw new AuthError(
      "Forbidden, only an admin or a soldier can check a visitor out",
      403
    );
  }

  const visitId = req.params.visitId;
  const updates = req.body;
  const keys = Object.keys(updates);

  if (!(keys.length === 1 && keys.includes("status"))) {
    throw new CustomError("You can only update the status field !", 400);
  }

  if (updates.status !== "checked-out") {
    throw new CustomError(
      "The value of status should be 'checked-out' only !",
      400
    );
  }

  try {
    const result = await Visit.signOut(visitId, updates);
    res.status(200).json({
      success: true,
      message: "Check out was successful",
      result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteVisit(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin"].includes(user.role)) {
    throw new AuthError("Forbidden, only an admin can delete a visit", 403);
  }

  const visitId = req.params.visitId;

  try {
    const result = await Visit.remove(visitId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getVisits(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    throw new AuthError(
      "Forbidden, only an admin or a soldier can view visitor logs",
      403
    );
  }

  const { host = "", purpose = "", status = "", page = 1 } = req.query;
  const limit = 2;

  const offset = (Number(page) - 1) * limit;

  try {
    const visits = await Visit.list({
      host,
      purpose,
      status,
      limit,
      offset,
      currentPage: Number(page),
    });

    res.json(visits);
  } catch (error) {
    next(error);
  }
}

async function getTodaysVisits(req, res, next) {
  const user = req.user;
  const page = Number(req.query.page) || 1

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    return next(
      AuthError("Forbidden, only admins and soldiers can get today visits", 403)
    );
  }

  try {
    const result = await Visit.getTodaysVisitorStats(page);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    return next(
      new AuthError(
        "Forbidden, only admins and soldiers can get visit stats",
        403
      )
    );
  }

  try {
    const stats = await Visit.getStatistics();
    res.json({
      stats,
    });
  } catch (err) {
    next(err);
  }
}

function getPurposes(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    return next(
      new AuthError(
        "Forbidden, only an admin and a soldier can get purposes",
        403
      )
    );
  }

  res.json({
    purposes: visitPurposes,
  });
}

module.exports = {
  createVisit,
  checkOut,
  deleteVisit,
  getVisits,
  getPurposes,
  getStats,
  getTodaysVisits,
};
