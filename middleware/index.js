/* function handleError(err, req, res, next) {
  if (req.headersSent) {
    next(err);
  }
  console.error(err)
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error!";
  let fieldErrors = null;

  // Group validation errors by field names
  if ((err.name = "ValidationError")) {
    statusCode = 400;

    fieldErrors = {};

    for (const field in err.errors) {
      fieldErrors[field] = err.errors[field].message;
    }

    message = "Validation failed!";
  }

  const errorResponse = {
    statusCode,
    message,
  };

  if (fieldErrors) {
    errorResponse.errors = fieldErrors;
  }

  res.status(statusCode).json(errorResponse);
} */

function handleError(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // Mongoose validation errors (e.g., schema fails)
  if (err.name === "ValidationError") {
    status = 400;
    errors = {};

    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }

    message = "Validation failed";
  }

  // MongoDB duplicate key errors (e.g., unique email/phone)
  else if (err.name === "MongoServerError" && err.code === 11000) {
    status = 400;
    errors = {};

    for (const key in err.keyValue) {
      errors[key] = `${key} "${err.keyValue[key]}" is already in use`;
    }

    message = "Duplicate field value";
  }

  // Invalid ObjectId or casting errors
  else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    errors = { [err.path]: message };
  }

  // JWT-related errors (e.g., expired or malformed tokens)
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token";
  }

  const errorResponse = {
    error: {
      name: err.name,
      message,
      statusCode: status,
      ...(errors && { errors }),
    },
  };

  // Attach stack trace in development mode
  if (process.env.NODE_ENV !== "production") {
    errorResponse.error.stack = err.stack;
  }

  res.status(status).json(errorResponse);
}


function handleNotFound(req, res, next) {
  return res.status(404).json({ error: "Not Found!" });
}

module.exports = {
  handleError,
  handleNotFound,
};
