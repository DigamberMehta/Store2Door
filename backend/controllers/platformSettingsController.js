import { asyncHandler } from "../middleware/validation.js";
import PlatformSettings from "../models/PlatformSettings.js";

// @desc    Get active platform settings
// @route   GET /api/platform-settings
// @access  Public
export const getPlatformSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne({ isActive: true });

  if (!settings) {
    // Create default settings if none exist
    settings = await PlatformSettings.create({
      markupPercentage: 20,
      commissionPercentage: 0,
      minimumOrderValue: 0,
      isActive: true,
    });
  }

  res.status(200).json({
    success: true,
    data: settings,
  });
});

// @desc    Update platform settings (Admin only)
// @route   PUT /api/platform-settings
// @access  Private/Admin
export const updatePlatformSettings = asyncHandler(async (req, res) => {
  const { markupPercentage, commissionPercentage, minimumOrderValue } =
    req.body;

  // Find active settings or create new one
  let settings = await PlatformSettings.findOne({ isActive: true });

  if (!settings) {
    // Create new settings
    settings = await PlatformSettings.create({
      markupPercentage: markupPercentage ?? 20,
      commissionPercentage: commissionPercentage ?? 0,
      minimumOrderValue: minimumOrderValue ?? 0,
      isActive: true,
    });
  } else {
    // Update existing settings
    if (markupPercentage !== undefined)
      settings.markupPercentage = markupPercentage;
    if (commissionPercentage !== undefined)
      settings.commissionPercentage = commissionPercentage;
    if (minimumOrderValue !== undefined)
      settings.minimumOrderValue = minimumOrderValue;

    await settings.save();
  }

  res.status(200).json({
    success: true,
    message: "Platform settings updated successfully",
    data: settings,
  });
});

// @desc    Calculate customer price with markup
// @route   GET /api/platform-settings/calculate-price?storePrice=100
// @access  Public
export const calculateCustomerPrice = asyncHandler(async (req, res) => {
  const { storePrice } = req.query;

  if (!storePrice || isNaN(storePrice)) {
    res.status(400);
    throw new Error("Valid store price is required");
  }

  const settings = await PlatformSettings.findOne({ isActive: true });
  const markup = settings?.markupPercentage || 20;

  const price = parseFloat(storePrice);
  const markupAmount = (price * markup) / 100;
  const customerPrice = price + markupAmount;

  res.status(200).json({
    success: true,
    data: {
      storePrice: price,
      markupPercentage: markup,
      markupAmount: parseFloat(markupAmount.toFixed(2)),
      customerPrice: parseFloat(customerPrice.toFixed(2)),
    },
  });
});
