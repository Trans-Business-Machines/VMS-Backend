const Users = require("../../models/users");
const { AuthError, CustomError } = require("../../utils");

async function getUsers(req, res, next) {
  const user = req.user;

  if (!["admin"].includes(user.role)) {
    return next(new AuthError("Forbidden, only an admin can list users.", 403));
  }

  const currentPage = Number(req.query.page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  try {
    const { totalPages, users } = await Users.list({ limit, offset });

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

  if (user.role === "admin" || user.userId === _id) {
    try {
      const { password, ...userData } = await Users.get({ _id });

      res.status(200).json(userData);
    } catch (error) {
      return next(error);
    }
  } else {
    return next(
      new AuthError("Unauthorized, you can only access your own records.", 401)
    );
  }
}

async function deleteUser(req, res, next) {
  const _id = req.params.id;
  const user = req.user;

  if (user.role !== "admin") {
    return next(
      new AuthError("Forbidden, only an admin can delete users.", 403)
    );
  }

  if (user.role === "admin" && _id === user.userId) {
    return next(new CustomError("You cannot delete the admin user.", 403));
  }

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

  if (user.role === "admin" || user.userId === _id) {
    try {
      // Check if the user is trying to update their own role
      if (updates.hasOwnProperty("role") && user.role !== "admin") {
        throw new AuthError(
          "Forbidden, only an admin can change user roles.",
          403
        );
      }

      const updatedUser = await Users.update(updates, { _id });

      if (!updatedUser) {
        throw new CustomError("User not found or update failed.", 404);
      }

      // Exclude password from the response
      const { password, ...userData } = updatedUser;

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
};
