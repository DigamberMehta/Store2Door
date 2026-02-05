import toast from "react-hot-toast";
import { getErrorMessage } from "./errorHandler";

/**
 * Mobile-optimized toast configuration
 */
const mobileToastConfig = {
  // Position at bottom for better mobile UX (thumb-friendly)
  position: "bottom-center",

  // Shorter duration for mobile (users read faster on mobile)
  duration: 3000,

  // Mobile-friendly styles
  style: {
    background: "#1a1a1a",
    color: "#fff",
    borderRadius: "12px",
    padding: "12px 16px",
    fontSize: "14px",
    maxWidth: "90vw",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
};

const errorToastConfig = {
  ...mobileToastConfig,
  style: {
    ...mobileToastConfig.style,
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  icon: "⚠️",
};

const successToastConfig = {
  ...mobileToastConfig,
  style: {
    ...mobileToastConfig.style,
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  icon: "✓",
};

/**
 * Show error toast with user-friendly message
 * @param {Error|string} error - Error object or string message
 * @param {string} fallback - Fallback message if error is an object
 */
export const showError = (error, fallback) => {
  const message =
    typeof error === "string" ? error : getErrorMessage(error, fallback);

  toast.error(message, errorToastConfig);
};

/**
 * Show success toast
 * @param {string} message - Success message
 */
export const showSuccess = (message) => {
  toast.success(message, successToastConfig);
};

/**
 * Show loading toast
 * @param {string} message - Loading message
 */
export const showLoading = (message) => {
  return toast.loading(message, {
    ...mobileToastConfig,
    duration: Infinity, // Loading toasts should persist
  });
};

/**
 * Dismiss a specific toast
 * @param {string} toastId - Toast ID to dismiss
 */
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAll = () => {
  toast.dismiss();
};

// Export default toast for custom use cases
export { toast };
