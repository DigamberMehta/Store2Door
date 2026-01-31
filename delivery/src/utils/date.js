/**
 * Consistent date and time formatting utilities for delivery app
 */

/**
 * Format date with relative time (Today, Yesterday) or absolute date
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return `Today, ${d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Format date only (no time)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string (e.g., "31 Jan 2026")
 */
export const formatDateOnly = (date) => {
  return new Date(date).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format time only (no date)
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string (e.g., "14:30")
 */
export const formatTimeOnly = (date) => {
  return new Date(date).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Format date and time separately
 * @param {Date|string} date - Date to format
 * @returns {object} Object with date and time strings
 */
export const formatDateTime = (date) => {
  return {
    date: formatDateOnly(date),
    time: formatTimeOnly(date),
  };
};

/**
 * Sort array by date (newest first)
 * @param {Array} array - Array of objects with date field
 * @param {string} dateField - Name of the date field (default: 'createdAt')
 * @returns {Array} Sorted array
 */
export const sortByDateDesc = (array, dateField = "createdAt") => {
  return [...array].sort((a, b) => {
    return new Date(b[dateField]) - new Date(a[dateField]);
  });
};

/**
 * Sort array by date (oldest first)
 * @param {Array} array - Array of objects with date field
 * @param {string} dateField - Name of the date field (default: 'createdAt')
 * @returns {Array} Sorted array
 */
export const sortByDateAsc = (array, dateField = "createdAt") => {
  return [...array].sort((a, b) => {
    return new Date(a[dateField]) - new Date(b[dateField]);
  });
};
