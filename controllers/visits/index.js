const Visit = require("../../models/visit");
const { AuthError, CustomError } = require("../../utils");

async function createVisit(req, res, next) {
  const user = req.user;

  if (!["admin", "soldier"].includes(user.role)) {
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

  if (!["admin", "soldier"].includes(user.role)) {
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

  if (!["admin"].includes(user.role)) {
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

  if (!["admin", "soldier"].includes(user.role)) {
    throw new AuthError(
      "Forbidden, only an admin or a soldier can view visitor logs",
      403
    );
  }

  const { host = "", purpose = "", status = "", page = 1 } = req.query;
  const limit = 10;

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

module.exports = {
  createVisit,
  checkOut,
  deleteVisit,
  getVisits,
};
