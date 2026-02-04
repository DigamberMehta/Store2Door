import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import locationService from "../services/locationService.js";
import { emitToUser } from "../config/socket.js";

/**
 * Get all active riders with their current locations
 * @route GET /api/admin/riders/active
 */
export const getActiveRiders = async (req, res) => {
  try {
    const { includeOffline = false } = req.query;

    // Build query - for tracking, get all riders (don't filter by verification status)
    // but exclude only suspended riders
    const query = {
      isSuspended: false,
    };

    const riders = await DeliveryRiderProfile.find(query)
      .populate("userId", "name email phone")
      .select(
        "userId vehicle isAvailable stats lastActiveAt onboardingCompleted isVerified",
      )
      .lean();

    console.log(`[DEBUG] Found ${riders.length} riders in DB (not suspended)`);
    console.log(
      `[DEBUG] Breakdown: Available=${riders.filter((r) => r.isAvailable).length}, Offline=${riders.filter((r) => !r.isAvailable).length}, Verified=${riders.filter((r) => r.isVerified).length}`,
    );

    console.log(
      `[DEBUG] Initial riders: ${riders.length} (Available: ${riders.filter((r) => r.isAvailable).length}, Offline: ${riders.filter((r) => !r.isAvailable).length})`,
    );

    // Filter out riders with null userId (orphaned records)
    const validRiders = riders.filter((rider) => rider.userId);
    console.log(
      `[DEBUG] Valid riders: ${validRiders.length} (excluded ${riders.length - validRiders.length} riders with null userId)`,
    );

    // Get locations from Redis for all riders
    const riderIds = validRiders.map((rider) => rider.userId._id.toString());
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

    // Merge location data with rider profiles - return ALL valid riders
    const ridersWithLocation = validRiders.map((rider) => {
      const riderId = rider.userId._id.toString();
      const location = locationMap[riderId];
      const activeOrder = orderMap[riderId];

      return {
        ...rider,
        currentLocation: location
          ? {
              type: "Point",
              coordinates: location.coordinates,
              lastUpdated: location.lastUpdated,
            }
          : null,
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        activeOrder: activeOrder || null,
      };
    });

    console.log(
      `[DEBUG] Total riders: ${ridersWithLocation.length} (Online: ${ridersWithLocation.filter((r) => r.latitude && r.longitude).length}, Offline/No location: ${ridersWithLocation.filter((r) => !r.latitude || !r.longitude).length})`,
    );

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

/**
 * Assign order to a rider (Admin)
 * @route POST /api/admin/orders/:orderId/assign
 */
export const assignOrderToRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!riderId) {
      return res.status(400).json({
        success: false,
        message: "Rider ID is required",
      });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be assigned
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot assign ${order.status} order`,
      });
    }

    // Get rider profile
    const riderProfile = await DeliveryRiderProfile.findOne({
      userId: riderId,
    });
    if (!riderProfile) {
      return res.status(404).json({
        success: false,
        message: "Rider profile not found",
      });
    }

    // Check if rider is available and verified
    if (!riderProfile.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Rider is not verified",
      });
    }

    if (riderProfile.isSuspended) {
      return res.status(400).json({
        success: false,
        message: "Rider is suspended",
      });
    }

    // Assign rider to order
    const previousRiderId = order.riderId;
    order.riderId = riderId;

    // Update status to assigned if it's pending
    if (order.status === "pending") {
      order.status = "assigned";
    }

    await order.save();

    // Emit socket events
    if (previousRiderId) {
      emitToUser(previousRiderId.toString(), "order:updated", order);
    }
    emitToUser(riderId, "order:assigned", order);
    emitToUser(order.customerId.toString(), "order:updated", order);

    res.json({
      success: true,
      message: "Order assigned successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error assigning order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign order",
      error: error.message,
    });
  }
};

/**
 * Unassign order from rider (Admin)
 * @route POST /api/admin/orders/:orderId/unassign
 */
export const unassignOrderFromRider = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order has a rider
    if (!order.riderId) {
      return res.status(400).json({
        success: false,
        message: "Order has no assigned rider",
      });
    }

    // Check if order can be unassigned
    if (order.status === "delivered" || order.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot unassign ${order.status} order`,
      });
    }

    // If order is picked up or on the way, don't allow unassign
    if (order.status === "picked_up" || order.status === "on_the_way") {
      return res.status(400).json({
        success: false,
        message:
          "Cannot unassign order that is already picked up or in transit",
      });
    }

    const previousRiderId = order.riderId.toString();
    order.riderId = null;
    order.status = "pending"; // Reset to pending

    await order.save();

    // Emit socket event to previous rider
    emitToUser(previousRiderId, "order:unassigned", order);
    emitToUser(order.customerId.toString(), "order:updated", order);

    res.json({
      success: true,
      message: "Order unassigned successfully",
      data: { order },
    });
  } catch (error) {
    console.error("Error unassigning order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unassign order",
      error: error.message,
    });
  }
};
