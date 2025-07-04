// Import external modules
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// Import internal modules
const { CustomError } = require("../utils/");
const {
  jwtAccessTokenOpts,
  jwtRefreshTokenOpts,
  SALT_ROUNDS,
} = require("../constants");

// LOAD .env variables
dotenv.config();

// Get the JWT secrets from environment variables
const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Import the user schema from schemas directory
const { userSchema, scheduleSchema } = require("../schemas");

// Create the users model
const Users = mongoose.model("Users", userSchema);
const Schedule = mongoose.model("Schedules", scheduleSchema);

/* ------------------------- User Model Functions  -------------------------*/
async function createAccount(fields) {
  try {
    //Try to insert user to DB
    // Create an in memory user object first
    const newUser = new Users(fields);

    // Hash the password of the new in memory user
    newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS);

    // Write the in memory user to the database
    await newUser.save();

    return {
      user: {
        userId: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  } catch (error) {
    throw error;
  }
}

async function createTokens(user, existingToken) {
  // create an access token
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    JWT_TOKEN_SECRET,
    jwtAccessTokenOpts
  );

  // check if a valid refresh token existings if not create another
  let refreshToken = null;

  if (existingToken) {
    // verify signature
    try {
      // if the existing token is valid return it
      const decoded = jwt.verify(existingToken, JWT_REFRESH_SECRET);
      refreshToken = existingToken;
    } catch (err) {
      // if token exists and has expired create a new one
      refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        JWT_REFRESH_SECRET,
        jwtRefreshTokenOpts
      );
    }
  } else {
    // if it does not exist,  create one
    refreshToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_REFRESH_SECRET,
      jwtRefreshTokenOpts
    );
  }

  // return a result object
  return {
    accessToken,
    refreshToken,
  };
}

async function get(filter, options = { includePassword: false }) {
  try {
    const projection = options.includePassword ? "-__v" : "-__v -password";
    const user = await Users.findOne(filter).select(projection);

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    return user;
  } catch (error) {
    throw error;
  }
}

async function list(opts = {}) {
  const { limit, offset, role } = opts;

  const totalUsers = await Users.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  let filter = {};

  // if you are a super admin you can view all users except yourself

  if (role === "super admin") {
    filter.role = { $ne: "super admin" };
  }
  //  Otherwise if you are admin you can only view hosts, soldier, and receptionist users only.
  else if (role === "admin") {
    filter.role = { $nin: ["super admin", "admin"] };
  }

  try {
    const users = await Users.find(filter, "-password", { lean: true })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .select("-__v");

    return {
      users,
      totalPages,
    };
  } catch (error) {
    throw new CustomError(error ? error.message : "Failed to fetch users", 500);
  }
}

async function update(updates, filter) {
  try {
    const result = await Users.findByIdAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    })
      .select("-__v -password")
      .lean();

    return result;
  } catch (error) {
    throw error;
  }
}

async function remove(filter) {
  try {
    const result = await Users.deleteOne(filter);
    if (result.deletedCount === 0) {
      throw new CustomError("User not found or already deleted!", 404);
    }
    return { message: "User deleted successfully" };
  } catch (error) {
    throw error;
  }
}

async function createSchedule(fields) {
  try {
    const result = await Schedule.create(fields);
    return result;
  } catch (error) {
    throw error;
  }
}

async function retrieveHosts() {
  try {
    const hosts = Users.find(
      { role: { $in: ["host", "receptionist"] } },
      { _id: 1, firstname: 1, lastname: 1 }
    ).lean();

    return hosts;
  } catch (error) {
    throw error;
  }
}

/* ------------------------- Export the user methods  -------------------------*/
module.exports = {
  createAccount,
  createTokens,
  get,
  list,
  remove,
  update,
  createSchedule,
  retrieveHosts,
};
