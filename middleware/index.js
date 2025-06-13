function handleError(err, req, res, next) {
  if (req.headersSent) {
    next(err);
  }

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
}

function handleNotFound(req, res, next) {
  return res.status(404).json({ error: "Not Found!" });
}

module.exports = {
  handleError,
  handleNotFound,
};
