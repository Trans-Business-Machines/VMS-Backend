const Visit = require("../../models/visit");
const { AuthError, CustomError } = require("../../utils");

async function createVisit(req, res, next) {
  const user = req.user;

  if (user.role !== "soldier") {
    throw new AuthError(
      "Forbidden, only a soldier can create new visits.",
      403
    );
  }

  const visitor = req.body;

  try {
    const visitInfo = await Visit.checkIn(visitor);

    res.status(201).json({
      success: true,
      message: "Check in was successful",
      visit: visitInfo,
    });
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

module.exports = {
  createVisit,
  checkOut,
};
