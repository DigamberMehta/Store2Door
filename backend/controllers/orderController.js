import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import DeliverySettings from "../models/DeliverySettings.js";
import PlatformSettings from "../models/PlatformSettings.js";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import Store from "../models/Store.js";
import User from "../models/User.js";
import PlatformFinancials from "../models/PlatformFinancials.js";
import { emitToOrder, getIO } from "../config/socket.js";
import { sendOrderStatusEmail } from "../config/mailer.js";

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Create a new order
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items, // Array of { product: productId, quantity, selectedVariant }
      deliveryAddress, // Must include location: { coordinates: [lng, lat] }
      couponCode,
      tip,
      paymentMethod,
      paymentId,
      notes,
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Validate quantities (prevent negative or zero quantities)
    const invalidQuantity = items.find(
      (item) =>
        !item.quantity ||
        item.quantity <= 0 ||
        !Number.isInteger(item.quantity),
    );
    if (invalidQuantity) {
      return res.status(400).json({
        message: "All items must have positive integer quantities",
      });
    }

    // Validate tip (prevent negative tips)
    if (tip && (tip < 0 || isNaN(tip))) {
      return res.status(400).json({ message: "Invalid tip amount" });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.location ||
      !deliveryAddress.location.coordinates
    ) {
      return res
        .status(400)
        .json({ message: "Delivery address with coordinates is required" });
    }

    // Fetch all products from DB to get actual prices
    const productIds = items.map((item) => item.product);
    // Get unique product IDs to avoid duplicate queries
    const uniqueProductIds = [
      ...new Set(productIds.map((id) => id.toString())),
    ];
    const products = await Product.find({
      _id: { $in: uniqueProductIds },
      isActive: true,
    }).populate("storeId", "name location");

    // Validate that all unique products were found
    if (products.length !== uniqueProductIds.length) {
      return res
        .status(400)
        .json({ message: "Some products are invalid or unavailable" });
    }

    // Get the store (assuming single store per order)
    const storeId = products[0].storeId._id;
    const storeLocation = products[0].storeId.location;

    // Verify all products belong to the same store
    const allSameStore = products.every(
      (p) => p.storeId._id.toString() === storeId.toString(),
    );
    if (!allSameStore) {
      return res
        .status(400)
        .json({ message: "All items must be from the same store" });
    }

    // Validate store status - must be active, approved, not suspended, and not temporarily closed
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    if (!store.isActive) {
      return res.status(400).json({
        message: "This store is currently inactive and cannot accept orders",
      });
    }

    if (!store.isApproved) {
      return res.status(400).json({
        message:
          "This store is not yet approved and cannot accept orders. Please check back later.",
      });
    }

    if (store.isSuspended) {
      return res.status(400).json({
        message: `This store is currently suspended. ${store.suspensionReason || "Please contact support for more information."}`,
      });
    }

    if (store.isTemporarilyClosed) {
      return res.status(400).json({
        message: `This store is temporarily closed. ${store.temporaryCloseReason || "Please try again later."}`,
      });
    }

    // Validate stock availability
    for (const item of items) {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString(),
      );
      if (product.inventory && product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`,
        });
      }
    }

    // Calculate subtotal using DB prices (SECURE - no trust in frontend)
    let calculatedSubtotal = 0;
    const formattedItems = items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString(),
      );

      // Get actual price from DB - use retailPrice (customer-facing price with markup)
      let unitPrice =
        product.discountedPrice || product.retailPrice || product.price;

      // Add variant price modifier if applicable (apply markup to modifier)
      if (item.selectedVariant) {
        const variant = product.variants?.find(
          (v) =>
            v.name === item.selectedVariant.name &&
            v.value === item.selectedVariant.value,
        );
        if (variant) {
          const markupMultiplier = 1 + (product.markupPercentage || 20) / 100;
          unitPrice += (variant.priceModifier || 0) * markupMultiplier;
        }
      }

      // Add customizations cost (apply markup to wholesale customization costs)
      if (item.customizations && item.customizations.length > 0) {
        const markupMultiplier = 1 + (product.markupPercentage || 20) / 100;
        const customizationsCost = item.customizations.reduce(
          (sum, custom) =>
            sum + (custom.additionalCost || 0) * markupMultiplier,
          0,
        );
        unitPrice += customizationsCost;
      }

      // Round unit price to 2 decimals before calculation
      unitPrice = parseFloat(unitPrice.toFixed(2));
      const totalPrice = parseFloat((unitPrice * item.quantity).toFixed(2));
      calculatedSubtotal += totalPrice;

      return {
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        markupPercentage: product.markupPercentage || 20,
        selectedVariant: item.selectedVariant || null,
        customizations: item.customizations || [],
      };
    });

    // Round subtotal to 2 decimals

    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));

    // Calculate delivery fee based on distance (SECURE)
    let calculatedDeliveryFee = 0;
    if (storeLocation && storeLocation.coordinates) {
      const distance = calculateDistance(
        deliveryAddress.location.coordinates[1], // lat
        deliveryAddress.location.coordinates[0], // lng
        storeLocation.coordinates[1],
        storeLocation.coordinates[0],
      );

      // Get delivery settings
      const deliverySettings = await DeliverySettings.findOne({
        isActive: true,
      });
      if (deliverySettings && deliverySettings.distanceTiers) {
        // Find applicable tier
        const tier = deliverySettings.distanceTiers
          .sort((a, b) => a.maxDistance - b.maxDistance)
          .find((t) => distance <= t.maxDistance);

        calculatedDeliveryFee = tier ? tier.charge : 30; // Default R30 if no tier matches
      } else {
        // Fallback: R30 flat rate
        calculatedDeliveryFee = 30;
      }
    } else {
      calculatedDeliveryFee = 30; // Default delivery fee
    }

    // Validate and apply coupon (SECURE)
    let calculatedDiscount = 0;
    let appliedCouponData = null;
    let isFreeDelivery = false;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      }).populate("applicableStores");

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      // Check if coupon applies to this store
      if (coupon.applicableStores.length > 0) {
        const storeApplicable = coupon.applicableStores.some(
          (s) => s._id.toString() === storeId.toString(),
        );
        if (!storeApplicable) {
          return res
            .status(400)
            .json({ message: "Coupon not applicable to this store" });
        }
      }

      // Check minimum order value
      if (calculatedSubtotal < coupon.minOrderValue) {
        return res.status(400).json({
          message: `Minimum order value of R${coupon.minOrderValue} required`,
        });
      }

      // Check usage limits
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // Check user usage limit
      const userUsageCount = coupon.usedBy.filter(
        (u) => u.userId && u.userId.toString() === userId.toString(),
      ).length;
      if (userUsageCount >= coupon.userUsageLimit) {
        return res
          .status(400)
          .json({ message: "You have already used this coupon" });
      }

      // Calculate discount based on type
      if (coupon.discountType === "percentage") {
        calculatedDiscount = parseFloat(
          ((calculatedSubtotal * coupon.discountValue) / 100).toFixed(2),
        );
        if (coupon.maxDiscount) {
          calculatedDiscount = Math.min(calculatedDiscount, coupon.maxDiscount);
          calculatedDiscount = parseFloat(calculatedDiscount.toFixed(2));
        }
      } else if (coupon.discountType === "fixed") {
        calculatedDiscount = parseFloat(coupon.discountValue.toFixed(2));
      } else if (coupon.discountType === "free_delivery") {
        isFreeDelivery = true;
        calculatedDiscount = 0;
      }

      calculatedDiscount = parseFloat(calculatedDiscount.toFixed(2));

      appliedCouponData = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: calculatedDiscount,
      };
    }

    // Apply free delivery (if coupon provides it)
    if (isFreeDelivery) {
      calculatedDeliveryFee = 0;
    }

    // Round delivery fee to 2 decimals
    calculatedDeliveryFee = parseFloat(calculatedDeliveryFee.toFixed(2));

    // Calculate final total (SECURE - all backend calculated)
    // Round tip and ensure all components are 2 decimal places
    const roundedTip = parseFloat((tip || 0).toFixed(2));
    const calculatedTotal = parseFloat(
      (
        calculatedSubtotal +
        calculatedDeliveryFee +
        roundedTip -
        calculatedDiscount
      ).toFixed(2),
    );

    // Calculate payment split
    // Store gets the wholesale price (sum of all product wholesale prices)
    const storeAmount = formattedItems.reduce((sum, item) => {
      const product = products.find(
        (p) => p._id.toString() === item.productId.toString(),
      );
      const wholesalePrice = product.price || 0; // Original store price without markup
      return sum + wholesalePrice * item.quantity;
    }, 0);

    // Driver gets delivery fee + tip (always full amount, never discounted)
    const driverAmount = calculatedDeliveryFee + roundedTip;

    // Calculate total markup across all products
    const totalMarkup = formattedItems.reduce((sum, item) => {
      const markupAmount =
        item.unitPrice - item.unitPrice / (1 + item.markupPercentage / 100);
      return sum + markupAmount * item.quantity;
    }, 0);

    // Platform absorbs the discount
    const discountAbsorbed = calculatedDiscount;

    // Platform net earnings = markup - discount absorbed
    const platformNetEarnings = totalMarkup - discountAbsorbed;

    const paymentSplit = {
      storeAmount: parseFloat(storeAmount.toFixed(2)),
      driverAmount: parseFloat(driverAmount.toFixed(2)),
      platformAmount: parseFloat(platformNetEarnings.toFixed(2)),
      platformBreakdown: {
        totalMarkup: parseFloat(totalMarkup.toFixed(2)),
        discountAbsorbed: parseFloat(discountAbsorbed.toFixed(2)),
        netEarnings: parseFloat(platformNetEarnings.toFixed(2)),
      },
    };

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Transform deliveryAddress to extract coordinates from GeoJSON format
    const transformedDeliveryAddress = {
      street: deliveryAddress.street,
      city: deliveryAddress.city,
      province: deliveryAddress.province,
      postalCode: deliveryAddress.postalCode,
      country: deliveryAddress.country || "US",
      latitude:
        deliveryAddress.location?.coordinates?.[1] ||
        deliveryAddress.latitude ||
        0,
      longitude:
        deliveryAddress.location?.coordinates?.[0] ||
        deliveryAddress.longitude ||
        0,
      instructions: deliveryAddress.instructions || "",
    };

    // Create order with BACKEND-CALCULATED values only
    // Order starts as 'pending' until payment is verified
    const order = new Order({
      orderNumber,
      customerId: userId,
      storeId,
      items: formattedItems,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      tip: roundedTip,
      discount: calculatedDiscount,
      total: calculatedTotal,
      deliveryAddress: transformedDeliveryAddress,
      appliedCoupon: appliedCouponData,
      paymentSplit: paymentSplit,
      paymentMethod: paymentMethod || "paystack_card",
      paymentId,
      status: "pending", // Will be updated to 'placed' after payment verification
      paymentStatus: "pending",
      trackingInfo: [
        {
          status: "pending",
          updatedAt: new Date(),
          notes: notes || "Order created - awaiting payment",
        },
      ],
    });

    await order.save();

    // If payment was made, link order to payment
    if (paymentId) {
      await Payment.findByIdAndUpdate(paymentId, {
        orderId: order._id,
      });
    }

    // If coupon was used, mark it as used
    if (appliedCouponData && appliedCouponData.code) {
      await Coupon.findOneAndUpdate(
        { code: appliedCouponData.code },
        {
          $inc: { usedCount: 1 },
          $push: {
            usedBy: {
              userId: userId,
              usedAt: new Date(),
              orderValue: calculatedSubtotal,
              discountApplied: calculatedDiscount,
            },
          },
        },
      );
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId: userId, status: "active" },
      {
        $set: {
          items: [],
          subtotal: 0,
          totalItems: 0,
          totalQuantity: 0,
          appliedCoupon: null,
          storeId: null,
          storeName: null,
        },
      },
    );

    // Emit socket event to notify store of new order
    try {
      const io = getIO();
      const populatedOrder = await Order.findById(order._id)
        .populate("customerId", "name email phone")
        .populate("items.productId", "name images price")
        .populate("storeId", "name location");

      io.emit("order:new-for-store", {
        storeId: storeId.toString(),
        order: populatedOrder,
      });

      console.log(
        `[Socket] New order ${order.orderNumber} emitted to store ${storeId}`,
      );
    } catch (socketError) {
      console.error("Error emitting new order event:", socketError);
      // Don't fail the order creation if socket fails
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/**
 * Get all orders for authenticated user
 * @route GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { customerId: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("items.productId", "name images")
      .populate("storeId", "name")
      .populate("paymentId")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * Get a single order by ID
 * @route GET /api/orders/:orderId
 */
export const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, customerId: userId })
      .populate("storeId", "name address")
      .populate("customerId", "name phone")
      .populate("riderId", "name phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * Cancel an order
 * @route POST /api/orders/:orderId/cancel
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, customerId: userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order can be cancelled
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    order.status = "cancelled";
    order.cancellationReason = reason;
    order.cancelledAt = new Date();
    await order.save();

    // TODO: Initiate refund if payment was made
    if (order.paymentId && order.paymentStatus === "succeeded") {
      // This should be handled by payment controller
      // For now, just update payment status
      await Payment.findByIdAndUpdate(order.paymentId, {
        status: "refund_pending",
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/**
 * Track order status
 * @route GET /api/orders/:orderId/track
 */
export const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, customerId: userId })
      .populate("riderId", "name phone")
      .populate("storeId", "name address");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const trackingInfo = {
      orderId: order._id,
      status: order.status,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      pickedUpAt: order.pickedUpAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      deliveryRider: order.deliveryRider,
      currentLocation: order.currentLocation,
      deliveryAddress: order.deliveryAddress,
      stores: order.items.map((item) => ({
        name: item.store?.name,
        address: item.store?.address,
      })),
    };

    res.json({
      success: true,
      tracking: trackingInfo,
    });
  } catch (error) {
    console.error("Track order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
      error: error.message,
    });
  }
};

/**
 * Accept order (Driver assigns themselves to the order)
 * @route POST /api/orders/:orderId/accept
 */
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId)
      .populate("storeId", "name address")
      .populate("customerId", "name email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order is available for pickup
    if (order.status !== "ready_for_pickup" && order.status !== "confirmed") {
      return res.status(400).json({
        success: false,
        message: "Order is not available for pickup",
      });
    }

    // Check if order is already assigned
    if (order.riderId) {
      return res.status(400).json({
        success: false,
        message: "Order is already assigned to another driver",
      });
    }

    // Check if driver already has an active order
    const activeOrder = await Order.findOne({
      riderId: userId,
      status: { $in: ["assigned", "on_the_way"] },
    });

    if (activeOrder) {
      return res.status(400).json({
        success: false,
        message:
          "You already have an active order. Please complete or cancel it before accepting a new one.",
      });
    }

    // Assign driver to order (but don't mark as picked up yet)
    order.riderId = userId;
    order.status = "assigned"; // Driver accepted, heading to store
    // status will change to "picked_up" when driver marks it as picked up
    // Note: trackingHistory is automatically updated by pre-save middleware

    await order.save();

    res.json({
      success: true,
      message:
        "Order accepted successfully. Please go to the store to pick it up.",
      data: order,
    });
  } catch (error) {
    console.error("Accept order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to accept order",
      error: error.message,
    });
  }
};

/**
 * Update order status (Admin/Rider only)
 * @route PATCH /api/orders/:orderId/status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Use the Order model's updateStatus method which handles transactions
    await order.updateStatus(status, notes);

    // Update driver profile stats (for analytics only, not for balance tracking)
    if (status === "delivered" && order.riderId) {
      try {
        const driverProfile = await DeliveryRiderProfile.findOne({
          userId: order.riderId,
        });
        if (driverProfile) {
          driverProfile.stats.completedDeliveries += 1;
          await driverProfile.save();
        }
      } catch (error) {
        console.error("[Stats Update] Error updating driver stats:", error);
      }
    }

    // Update store stats (for analytics only, not for balance tracking)
    if (status === "delivered" && order.storeId) {
      try {
        const store = await Store.findById(order.storeId);
        if (store) {
          store.stats.totalOrders = (store.stats.totalOrders || 0) + 1;
          await store.save();
        }
      } catch (error) {
        console.error("[Stats Update] Error updating store stats:", error);
      }
    }

    // Update platform financials for reporting
    if (status === "delivered") {
      try {
        const paymentSplit = order.calculatePaymentSplit();
        await PlatformFinancials.recordOrderDelivery({
          subtotal: order.subtotal,
          platformCommission: paymentSplit.platformAmount,
          storeEarnings: paymentSplit.storeAmount,
          deliveryFee: order.deliveryFee || 0,
          tip: order.tip || 0,
          discount: order.discount || 0,
        });
      } catch (error) {
        console.error(
          "[Financials Update] Error updating platform financials:",
          error,
        );
      }
    } else if (status === "cancelled") {
      try {
        await PlatformFinancials.recordOrderCancellation();
      } catch (error) {
        console.error(
          "[Financials Update] Error recording cancellation:",
          error,
        );
      }
    }

    // Note: trackingHistory is automatically updated by pre-save middleware in Order model

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    // Send status update email to customer
    try {
      const user = await User.findById(order.customerId);
      if (user) {
        // Only send for important status changes
        const importantStatuses = [
          "confirmed",
          "picked_up",
          "on_the_way",
          "delivered",
          "cancelled",
        ];
        if (importantStatuses.includes(status)) {
          await sendOrderStatusEmail(order, user.email, user.name, status);
          console.log(
            `Status update email (${status}) sent for order ${order.orderNumber}`,
          );
        }
      }
    } catch (emailError) {
      console.error("Error sending status update email:", emailError);
    }

    // Emit socket event for real-time update
    emitToOrder(orderId, "order:status-changed", {
      orderId,
      status,
      trackingHistory: order.trackingHistory,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};
