const Users = require("../../models/users");
const { AuthError, CustomError } = require("../../utils");

async function getUsers(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin"].includes(user.role)) {
    return next(new AuthError("Forbidden, only an admin can list users.", 403));
  }

  const currentPage = Number(req.query.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  try {
    const { totalPages, users } = await Users.list({
      limit,
      offset,
      role: user.role,
    });

    const hasNext = currentPage < totalPages;
    const hasPrev = currentPage > 1;

    res.json({
      hasNext,
      hasPrev,
      users,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
}

async function getOneUser(req, res, next) {
  const _id = req.params.id;
  const user = req.user;

  try {
    const targetUser = await Users.get({ _id });

    if (user.role === "super admin" || user.userId === _id) {
      // return user info
      res.json(targetUser);
    } else if (
      user.role === "admin" &&
      !["admin", "super admin"].includes(targetUser.role)
    ) {
      // return user info
      res.json(targetUser);
    } else {
      // throw an error
      throw new AuthError("Access denied !", 403);
    }
  } catch (error) {
    next(error);
  }
}

async function getRoles(req, res, next) {
  const allRoles = ["admin", "host", "receptionist", "soldier"];
  const user = req.user;

  try {
    if (user.role === "super admin") {
      return res.json({
        roles: allRoles,
      });
    } else if (user.role === "admin") {
      const roles = allRoles.filter((role) => role !== "admin");

      return res.json({
        roles,
      });
    }

    throw new AuthError("Unauthorized to get user roles.", 401);
  } catch (error) {
    next(error);
  }
}

async function setAvailability(req, res, next) {
  const user = req.user;
  const hostId = req.params.hostId;

  if (!["host", "receptionist"].includes(user.role)) {
    return next(
      new AuthError(
        "Forbidden, only a host or receptionist can create their schedule!",
        403
      )
    );
  }

  if (user.userId !== hostId) {
    return next(
      new CustomError(
        "Only the user themselves can create their own schedule",
        403
      )
    );
  }

  const fields = req.body;

  fields.host = hostId;

  try {
    const result = await Users.createSchedule(fields);

    res.status(201).json({
      success: true,
      message: "Schedule created",
      schedule: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyAvailabilty(req, res, next) {
  const user = req.user;
  const requesterId = req.params.hostId

  if (user.userId !== requesterId) {
    return next(new AuthError("Forbidden, You can only access your own schedules", 403))
  }

  try {
    const schedules = await Users.getHostAvailabilty(requesterId)
    res.json({ success: true, schedules })
  } catch (error) {
    next(error)
  }

}

async function updateAvailability(req, res, next) {
  const user = req.user;
  const hostId = req.params.hostId;
  const scheduleId = req.params.scheduleId

  if (!["host", "receptionist"].includes(user.role)) {
    return next(
      new AuthError(
        "Forbidden, only a host or receptionist can update their availability!",
        403
      )
    );
  }

  if (hostId !== user.userId) {
    return next(
      new AuthError(
        "You can't update another person's availability schedule!",
        403
      )
    );
  }

  const updates = req.body;

  if (updates.hasOwnProperty("host")) {
    return next(
      new CustomError("You can only update start date and end date!", 400)
    );
  }

  try {
    const result = await Users.updateSchedule(updates, { _id: scheduleId, host: hostId });

    if (!result) {
      throw new CustomError("Schedule not found or is already deleted!", 404);
    }
    res.json({
      success: true,
      message: "Scudule updated successfully",
      schedule: result,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteMyAvailability(req, res, next) {
  const user = req.user;
  const requesterId = req.params.hostId
  const scheduleId = req.params.scheduleId

  if (user.userId !== requesterId) {
    return next(new AuthError("Forbidden, You can only delete your schedules", 403))
  }

  try {

    const success = Users.deleteMyAvailability(requesterId, scheduleId)

    let message = success ? "Delete was successfull" : "Failed to delete schedule"

    res.json({
      success,
      message
    })

  } catch (error) {
    next(error)
  }
}

async function deleteUser(req, res, next) {
  const _id = req.params.id;
  const user = req.user;

  // Ensure only admins or super admin can delete users
  if (!["super admin", "admin"].includes(user.role)) {
    return next(
      new AuthError("Forbidden, only an admin can delete users.", 403)
    );
  }

  const targetUser = await Users.get({ _id });

  // Forbid an admin from deleting a super admin or another admin
  if (
    user.role === "admin" &&
    ["super admin", "admin"].includes(targetUser.role)
  ) {
    return next(
      new AuthError(
        "Forbidden, an admin can't delete a super admin or a fellow admin",
        403
      )
    );
  }

  // Delete the user
  try {
    const result = await Users.remove({ _id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  const _id = req.params.id;
  const user = req.user;
  const updates = req.updates;

  // check if the user is a super admin, admin the the user himself.
  if (["super admin", "admin"].includes(user.role) || user.userId === _id) {
    try {
      // Forbid a user from trying to update their own role
      if (
        updates.hasOwnProperty("role") &&
        !["super admin", "admin"].includes(user.role)
      ) {
        throw new AuthError(
          "Forbidden, only an admin can change user roles.",
          403
        );
      }

      // Forbid an admin from trying to update role either super admin or admin
      if (
        user.role === "admin" &&
        ["super admin", "admin"].includes(updates.role)
      ) {
        throw new AuthError(
          "Forbidden, only a super admin can update a user role to either admin or super admin!",
          403
        );
      }
      const updatedUser = await Users.update(updates, { _id });

      if (!updatedUser) {
        throw new CustomError("User not found or update failed.", 404);
      }

      // Return back a response to client
      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      next(error);
    }
  } else {
    return next(
      new AuthError(
        "Forbidden, only an admin or the user themselves can update this record.",
        403
      )
    );
  }
}

async function getHosts(req, res, next) {
  const user = req.user;

  if (!["super admin", "admin", "soldier"].includes(user.role)) {
    return next(
      new AuthError("Forbidden, only admins and soldiers can get hosts", 403)
    );
  }

  try {
    const hosts = await Users.retrieveHosts();
    res.json({
      hosts,
    });
  } catch (error) {
    next(error);
  }
}

async function getHostsWithSchedules(req, res, next) {
  const user = req.user;

  if (!["admin", "super admin"].includes(user.role)) {
    return next(new AuthError("Only admins can view host schedules", 403));
  }

  try {
    const schedules = await Users.getSchedules();

    res.json(schedules);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  getOneUser,
  deleteUser,
  updateUser,
  getRoles,
  setAvailability,
  getHosts,
  updateAvailability,
  getMyAvailabilty,
  getHostsWithSchedules,
  deleteMyAvailability
};
