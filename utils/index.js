// Custom Error classes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

class AuthError extends AppError {}
class CustomError extends AppError {}



module.exports = { AuthError, CustomError };
