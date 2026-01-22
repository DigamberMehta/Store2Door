/**
 * Tips Configuration
 * Defines preset tip options and validation rules
 */

// Tip calculation based on percentage of bill
export const TIP_PERCENTAGES = [
  { label: "10%", value: 10 },
  { label: "20%", value: 20 },
  { label: "30%", value: 30 },
];

// Tip validation constraints
export const TIP_CONSTRAINTS = {
  minTip: 0,
  maxTip: 1000, // Maximum tip amount in ZAR
  defaultTip: 0,
  allowCustomAmount: true,
};

/**
 * Calculate tip amount from percentage
 * @param {number} billAmount - Total bill amount
 * @param {number} percentage - Tip percentage (10, 20, 30)
 * @returns {number} Calculated tip amount (rounded)
 */
export const calculateTipFromPercentage = (billAmount, percentage) => {
  if (!billAmount || !percentage) return 0;
  return Math.round((billAmount * percentage) / 100);
};

/**
 * Validate tip amount
 * @param {number} amount - Tip amount to validate
 * @returns {boolean} Whether the tip amount is valid
 */
export const validateTipAmount = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return false;
  if (amount < TIP_CONSTRAINTS.minTip) return false;
  if (amount > TIP_CONSTRAINTS.maxTip) return false;
  return true;
};

/**
 * Get suggested tip amounts based on bill
 * @param {number} billAmount - Total bill amount
 * @returns {Array} Array of suggested tip options
 */
export const getSuggestedTips = (billAmount) => {
  return TIP_PERCENTAGES.map((preset) => ({
    label: preset.label,
    percentage: preset.value,
    amount: calculateTipFromPercentage(billAmount, preset.value),
  }));
};

export default {
  TIP_PERCENTAGES,
  TIP_CONSTRAINTS,
  calculateTipFromPercentage,
  validateTipAmount,
  getSuggestedTips,
};
