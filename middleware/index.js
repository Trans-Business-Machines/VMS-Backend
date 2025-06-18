function handleError(err, req, res, next) {
  if (req.headersSent) {
    next(err);
  }
  console.error(err);
  let statusCode = err.statusCode || 500;
  let message = err?.message || "Internal server error!";
  let fieldErrors = null;

  // Group validation errors by field names
  if (err.name === "ValidationError") {
    statusCode = 400;

    fieldErrors = {};

    for (const key in err.errors) {
      fieldErrors[key] = err.errors[key].message;
    }

    message = "Validation failed!";
  }

  // Group Duplication errors by field names
  if (err.name === "MongoServerError" && err.code === 11000) {
    statusCode = 400;
    fieldErrors = {};
    message = "Duplicate field(s) encountered!";

    for (const key in err.keyValue) {
      fieldErrors[key] = `${err.keyValue[key]} is already in use.`;
    }
  }

  //Handle updates to immutable _id file
  if (err.name === "MongoServerError" && err.code === 66) {
    statusCode = 400;
    message = "Cannot update immutable _id field.";
  }

  const errorResponse = {
    statusCode,
    message,
  };

  if (fieldErrors) {
    errorResponse.errors = fieldErrors;
  }

  res.status(statusCode).json(errorResponse);
}

function handleNotFound(req, res, next) {
  return res.status(404).json({ error: "Not Found!" });
}

module.exports = {
  handleError,
  handleNotFound,
};
