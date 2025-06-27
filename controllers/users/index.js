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
  const _id = req.params.id;

  if (!["host", "receptionist"].includes(user.role)) {
    return next(
      new AuthError(
        "Forbidden, only a host or receptionist can create their schedule!",
        403
      )
    );
  }

  if (user.userId !== _id) {
    return next(
      new CustomError(
        "Only the user themselves can create their own schedule",
        403
      )
    );
  }

  const fields = req.body;

  fields.start_date = new Date(fields.start_date).getTime();
  fields.end_date = new Date(fields.end_date).getTime();

  console.log(fields);

  try {
    const result = await Users.createSchedule(fields);

    res.status(201).json({
      success: true,
      message: "Schedule created",
      result,
    });
  } catch (error) {
    next(error);
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
  const updates = req.body;

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

      // Exclude password from the response
      const { password, ...userData } = updatedUser;

      // Return back a response to client
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: userData,
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

module.exports = {
  getUsers,
  getOneUser,
  deleteUser,
  updateUser,
  getRoles,
  setAvailability,
};
