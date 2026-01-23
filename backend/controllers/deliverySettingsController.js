import { asyncHandler } from "../middleware/validation.js";
import DeliverySettings from "../models/DeliverySettings.js";

// @desc    Get active delivery settings
// @route   GET /api/delivery-settings
// @access  Public
export const getDeliverySettings = asyncHandler(async (req, res) => {
  const settings = await DeliverySettings.findOne({ isActive: true });
  
  if (!settings) {
    // Return default settings if none exist
    return res.status(200).json({
      success: true,
      data: {
        distanceTiers: [
          { maxDistance: 5, charge: 30 },
          { maxDistance: 7, charge: 35 }
        ],
        maxDeliveryDistance: 7,
        currency: "R",
        isActive: true
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Create or update delivery settings (Admin only)
// @route   POST /api/delivery-settings
// @access  Private/Admin
export const createOrUpdateSettings = asyncHandler(async (req, res) => {
  const { distanceTiers, maxDeliveryDistance, currency } = req.body;
  
  // Validation
  if (!distanceTiers || !Array.isArray(distanceTiers) || distanceTiers.length === 0) {
    res.status(400);
    throw new Error("Distance tiers are required");
  }
  
  if (!maxDeliveryDistance || maxDeliveryDistance <= 0) {
    res.status(400);
    throw new Error("Maximum delivery distance must be greater than 0");
  }
  
  // Deactivate all existing settings
  await DeliverySettings.updateMany({}, { isActive: false });
  
  // Create new settings
  const settings = await DeliverySettings.create({
    distanceTiers,
    maxDeliveryDistance,
    currency: currency || "R",
    isActive: true
  });
  
  res.status(201).json({
    success: true,
    message: "Delivery settings updated successfully",
    data: settings
  });
});

// @desc    Get delivery charge for a distance
// @route   GET /api/delivery-settings/calculate-charge?distance=5.5
// @access  Public
export const calculateCharge = asyncHandler(async (req, res) => {
  const { distance } = req.query;
  
  if (!distance || isNaN(distance)) {
    res.status(400);
    throw new Error("Valid distance parameter is required");
  }
  
  const settings = await DeliverySettings.findOne({ isActive: true });
  
  if (!settings) {
    res.status(404);
    throw new Error("Delivery settings not configured");
  }
  
  const distanceNum = parseFloat(distance);
  
  if (distanceNum > settings.maxDeliveryDistance) {
    return res.status(200).json({
      success: false,
      message: "Distance exceeds maximum delivery range",
      data: {
        distance: distanceNum,
        maxDistance: settings.maxDeliveryDistance,
        canDeliver: false
      }
    });
  }
  
  // Find appropriate charge
  const sortedTiers = [...settings.distanceTiers].sort((a, b) => a.maxDistance - b.maxDistance);
  let charge = 0;
  
  for (const tier of sortedTiers) {
    if (distanceNum <= tier.maxDistance) {
      charge = tier.charge;
      break;
    }
  }
  
  if (charge === 0) {
    charge = sortedTiers[sortedTiers.length - 1].charge;
  }
  
  res.status(200).json({
    success: true,
    data: {
      distance: distanceNum,
      charge,
      currency: settings.currency,
      canDeliver: true
    }
  });
});
