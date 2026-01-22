import Coupon from "../models/Coupon.js";

/**
 * Create a new coupon (Admin only)
 * POST /api/admin/coupons
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue,
      validFrom,
      validUntil,
      usageLimit,
      userUsageLimit,
      applicableStores,
      applicableCategories,
      firstOrderOnly,
    } = req.body;

    // Validate required fields
    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message:
          "Required fields: code, discountType, discountValue, validUntil",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderValue: minOrderValue || 0,
      validFrom: validFrom || new Date(),
      validUntil,
      usageLimit,
      userUsageLimit: userUsageLimit || 1,
      applicableStores,
      applicableCategories,
      firstOrderOnly: firstOrderOnly || false,
      createdBy: req.user.id,
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

/**
 * Get all coupons (Admin only)
 * GET /api/admin/coupons
 */
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive, discountType, search } = req.query;

    const query = {};

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Filter by discount type
    if (discountType) {
      query.discountType = discountType;
    }

    // Search by code
    if (search) {
      query.code = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const coupons = await Coupon.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("applicableStores", "name")
      .populate("applicableCategories", "name");

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      data: coupons,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupons",
      error: error.message,
    });
  }
};

/**
 * Get single coupon by ID (Admin only)
 * GET /api/admin/coupons/:id
 */
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("applicableStores", "name")
      .populate("applicableCategories", "name");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Get coupon statistics
    const stats = await Coupon.getStats(coupon._id);

    res.json({
      success: true,
      data: {
        ...coupon.toObject(),
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon",
      error: error.message,
    });
  }
};

/**
 * Update coupon (Admin only)
 * PUT /api/admin/coupons/:id
 */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const allowedUpdates = [
      "description",
      "discountType",
      "discountValue",
      "maxDiscount",
      "minOrderValue",
      "validFrom",
      "validUntil",
      "usageLimit",
      "userUsageLimit",
      "applicableStores",
      "applicableCategories",
      "isActive",
      "firstOrderOnly",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        coupon[field] = req.body[field];
      }
    });

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update coupon",
      error: error.message,
    });
  }
};

/**
 * Delete coupon (Admin only)
 * DELETE /api/admin/coupons/:id
 */
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Soft delete by deactivating
    coupon.isActive = false;
    await coupon.save();

    res.json({
      success: true,
      message: "Coupon deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon",
      error: error.message,
    });
  }
};

/**
 * Toggle coupon active status (Admin only)
 * PATCH /api/admin/coupons/:id/toggle
 */
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      data: coupon,
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle coupon status",
      error: error.message,
    });
  }
};

/**
 * Get coupon statistics (Admin only)
 * GET /api/admin/coupons/:id/stats
 */
export const getCouponStats = async (req, res) => {
  try {
    const stats = await Coupon.getStats(req.params.id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching coupon stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch coupon stats",
      error: error.message,
    });
  }
};

/**
 * Get active coupons for users
 * GET /api/coupons/active
 */
export const getActiveCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const coupons = await Coupon.findValidForUser(userId);

    // Filter out coupons that user cannot use
    const availableCoupons = [];
    for (const coupon of coupons) {
      const validation = coupon.canUserUse(userId);
      if (validation.valid) {
        availableCoupons.push({
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          minOrderValue: coupon.minOrderValue,
          validUntil: coupon.validUntil,
        });
      }
    }

    res.json({
      success: true,
      data: availableCoupons,
    });
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active coupons",
      error: error.message,
    });
  }
};

/**
 * Validate coupon code
 * POST /api/coupons/validate
 */
export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    const validation = coupon.canUserUse(userId);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    res.json({
      success: true,
      message: "Coupon is valid",
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: error.message,
    });
  }
};
