/**
 * Extract user-friendly error message from API error
 * @param {Error} error - The error object from axios or other source
 * @param {string} fallbackMessage - Default message to show if no specific error found
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (
  error,
  fallbackMessage = "Something went wrong. Please try again.",
) => {
  // Check if it's an axios error with response
  if (error.response) {
    const { status, data } = error.response;

    // If backend provided a message, use it
    if (data?.message) {
      return data.message;
    }

    // Handle common HTTP status codes with user-friendly messages
    switch (status) {
      case 400:
        return "Invalid request. Please check your information and try again.";
      case 401:
        return "Please sign in to continue.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested item could not be found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "The information provided is invalid. Please check and try again.";
      case 429:
        return "Too many attempts. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later.";
      case 502:
      case 503:
        return "Service temporarily unavailable. Please try again in a few moments.";
      case 504:
        return "Request timed out. Please check your connection and try again.";
      default:
        return fallbackMessage;
    }
  }

  // Handle network errors
  if (error.message === "Network Error" || !error.response) {
    return "Network error. Please check your internet connection.";
  }

  // Handle timeout errors
  if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Fallback to custom message or error message (avoid technical details)
  return fallbackMessage;
};

/**
 * Show a user-friendly error toast
 * @param {Function} toastFunction - The toast.error function
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - Default message
 * @param {Object} toastOptions - Additional toast options
 */
export const showErrorToast = (
  toastFunction,
  error,
  fallbackMessage = "Something went wrong. Please try again.",
  toastOptions = {},
) => {
  const message = getErrorMessage(error, fallbackMessage);
  toastFunction(message, {
    duration: 3000,
    position: "top-center",
    style: {
      background: "#1a1a1a",
      color: "#fff",
      borderRadius: "8px",
    },
    ...toastOptions,
  });
};
