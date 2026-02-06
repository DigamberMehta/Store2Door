/**
 * Custom error class for application errors
 * Extends the built-in Error class with statusCode and isOperational properties
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
