/**
 * Format a price value to 2 decimal places
 * @param {number} price - The price value to format
 * @returns {string} - Formatted price with 2 decimal places
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return "0.00";
  }
  return Number(price).toFixed(2);
};
