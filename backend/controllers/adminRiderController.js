import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import locationService from "../services/locationService.js";

/**
 * Get all active riders with their current locations
 * @route GET /api/admin/riders/active
 */
export const getActiveRiders = async (req, res) => {
  try {
    const { includeOffline = false } = req.query;

    // Build query - only require verified and not suspended
    // Don't require isActive since riders actively delivering might have it set incorrectly
    const query = {
      isVerified: true,
      isSuspended: false,
    };

    const riders = await DeliveryRiderProfile.find(query)
      .populate("userId", "name email phone")
      .select(
        "userId vehicle isAvailable stats lastActiveAt onboardingCompleted",
      )
      .lean();

    // Get locations from Redis for all riders
    const riderIds = riders.map((rider) => rider.userId._id.toString());
    const locations = await locationService.getLocations(riderIds);

    // Get active orders for all riders (use correct field and status names)
    const activeOrders = await Order.find({
      riderId: { $in: riderIds },
      status: {
        $in: ["ready_for_pickup", "assigned", "picked_up", "on_the_way"],
      },
    })
      .populate("customerId", "name email phone")
      .populate("storeId", "name address phone")
      .select(
        "orderNumber status items total deliveryAddress customerId storeId riderId createdAt estimatedDeliveryTime",
      )
      .lean();

    // Create maps
    const locationMap = {};
    locations.forEach((loc) => {
      locationMap[loc.riderId] = loc;
    });

    const orderMap = {};
    activeOrders.forEach((order) => {
      // Only add to map if riderId exists
      if (order.riderId) {
        const riderIdStr = order.riderId.toString();
        orderMap[riderIdStr] = order;
      }
    });

    // Merge location data with rider profiles
    const ridersWithLocation = riders
      .map((rider) => {
        const riderId = rider.userId._id.toString();
        const location = locationMap[riderId];
        const activeOrder = orderMap[riderId];

        // Only include riders with fresh location data
        if (location && locationService.isLocationFresh(location)) {
          return {
            ...rider,
            currentLocation: {
              type: "Point",
              coordinates: location.coordinates,
              lastUpdated: location.lastUpdated,
            },
            latitude: location.latitude,
            longitude: location.longitude,
            activeOrder: activeOrder || null,
          };
        }
        return null;
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: {
        riders: ridersWithLocation,
        total: ridersWithLocation.length,
      },
    });
  } catch (error) {
    console.error("Error fetching active riders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active riders",
      error: error.message,
    });
  }
};

/**
 * Get all riders with pagination and filters
 * @route GET /api/admin/riders
 */
export const getAllRiders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      isAvailable,
      isVerified,
    } = req.query;

    const query = {};

    // Apply filters
    if (status === "active") query.isActive = true;
    if (status === "suspended") query.isSuspended = true;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === "true";
    if (isVerified !== undefined) query.isVerified = isVerified === "true";

    // Search by name, email, or phone
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
        role: "delivery_rider",
      }).select("_id");

      query.userId = { $in: users.map((u) => u._id) };
    }

    const skip = (page - 1) * limit;

    const [riders, total] = await Promise.all([
      DeliveryRiderProfile.find(query)
        .populate("userId", "name email phone")
        .sort({ lastActiveAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      DeliveryRiderProfile.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        riders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching riders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch riders",
      error: error.message,
    });
  }
};

/**
 * Get rider statistics
 * @route GET /api/admin/riders/stats/summary
 */
export const getRiderStats = async (req, res) => {
  try {
    const [
      totalRiders,
      activeRiders,
      onlineRiders,
      verifiedRiders,
      suspendedRiders,
    ] = await Promise.all([
      DeliveryRiderProfile.countDocuments(),
      DeliveryRiderProfile.countDocuments({ isActive: true }),
      DeliveryRiderProfile.countDocuments({
        isActive: true,
        isAvailable: true,
      }),
      DeliveryRiderProfile.countDocuments({ isVerified: true }),
      DeliveryRiderProfile.countDocuments({ isSuspended: true }),
    ]);

    res.json({
      success: true,
      data: {
        totalRiders,
        activeRiders,
        onlineRiders,
        verifiedRiders,
        suspendedRiders,
        offlineRiders: activeRiders - onlineRiders,
      },
    });
  } catch (error) {
    console.error("Error fetching rider stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rider statistics",
      error: error.message,
    });
  }
};
