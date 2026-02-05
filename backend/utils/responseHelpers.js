/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiError";
  }
}

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Success message (optional)
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (
  res,
  data = null,
  message = null,
  statusCode = 200,
) => {
  const response = { success: true };

  if (message) response.message = message;
  if (data !== null) response.data = data;

  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Error|ApiError} error - Error object
 */
export const sendError = (res, error) => {
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Internal server error",
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  // Log error for debugging
  if (statusCode === 500) {
    console.error("Server Error:", error);
  }

  res.status(statusCode).json(response);
};

/**
 * Common error creators
 */
export const notFoundError = (resource = "Resource") => {
  return new ApiError(404, `${resource} not found`);
};

export const badRequestError = (message = "Bad request") => {
  return new ApiError(400, message);
};

export const unauthorizedError = (message = "Unauthorized") => {
  return new ApiError(401, message);
};

export const forbiddenError = (message = "Forbidden") => {
  return new ApiError(403, message);
};

export const validationError = (message, errors = null) => {
  return new ApiError(422, message, errors);
};
