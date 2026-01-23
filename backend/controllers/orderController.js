import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import DeliverySettings from "../models/DeliverySettings.js";

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
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    }).populate("storeId", "name location");

    if (products.length !== items.length) {
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

      // Get actual price from DB
      let unitPrice = product.discountedPrice || product.price;

      // Add variant price modifier if applicable
      if (item.selectedVariant) {
        const variant = product.variants?.find(
          (v) =>
            v.name === item.selectedVariant.name &&
            v.value === item.selectedVariant.value,
        );
        if (variant) {
          unitPrice += variant.priceModifier || 0;
        }
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
        customizations: item.selectedVariant
          ? [
              {
                name: item.selectedVariant.name,
                value: item.selectedVariant.value,
              },
            ]
          : [],
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

    // Apply free delivery
    if (isFreeDelivery || calculatedSubtotal > 500) {
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

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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
      deliveryAddress,
      appliedCoupon: appliedCouponData,
      paymentMethod: paymentMethod || "yoco_card",
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
      { user: userId },
      {
        items: [],
        subtotal: 0,
        totalItems: 0,
        appliedCoupon: null,
      },
    );

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
      .populate("items.productId")
      .populate("storeId")
      .populate("paymentId")
      .populate("riderId");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
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

    order.status = status;

    // Set timestamps based on status
    if (status === "confirmed") {
      order.confirmedAt = new Date();
    } else if (status === "picked_up") {
      order.pickedUpAt = new Date();
    } else if (status === "delivered") {
      order.deliveredAt = new Date();
    } else if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      order,
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
