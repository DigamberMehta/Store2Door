import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Coupon from "../models/Coupon.js";

/**
 * Create a new order
 * @route POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      subtotal,
      deliveryFee,
      handlingFee,
      tip,
      discount,
      total,
      deliveryAddress,
      appliedCoupon,
      paymentMethod,
      paymentId,
      notes,
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Get the first item's store (for multi-store support, we'll need to create multiple orders)
    const firstItem = items[0];
    const storeId = firstItem.store;

    if (!storeId) {
      return res.status(400).json({ message: "Store ID is required" });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Format items for order schema
    const formattedItems = items.map((item) => ({
      productId: item.product,
      name: item.name || "Product", // We'll need to fetch this from product if not provided
      quantity: item.quantity,
      unitPrice: parseFloat(
        (item.unitPrice || item.discountedPrice).toFixed(2),
      ),
      totalPrice: parseFloat(
        ((item.discountedPrice || item.unitPrice) * item.quantity).toFixed(2),
      ),
      customizations: item.selectedVariant
        ? [
            {
              name: item.selectedVariant.name,
              value: item.selectedVariant.value,
            },
          ]
        : [],
    }));

    // Create order
    const order = new Order({
      orderNumber,
      customerId: userId,
      storeId,
      items: formattedItems,
      subtotal: parseFloat((subtotal || 0).toFixed(2)),
      deliveryFee: parseFloat((deliveryFee || 0).toFixed(2)),
      handlingFee: parseFloat((handlingFee || 0).toFixed(2)),
      tip: parseFloat((tip || 0).toFixed(2)),
      discount: parseFloat((discount || 0).toFixed(2)),
      total: parseFloat((total || 0).toFixed(2)),
      deliveryAddress,
      appliedCoupon,
      paymentMethod: paymentMethod || "yoco_card",
      paymentId,
      trackingInfo: [
        {
          status: "placed",
          updatedAt: new Date(),
          notes: notes || "Order placed",
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
    if (appliedCoupon && appliedCoupon.code) {
      await Coupon.findOneAndUpdate(
        { code: appliedCoupon.code },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: userId },
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
      .populate("items.product", "name images")
      .populate("items.store", "name")
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
      .populate("items.product")
      .populate("items.store")
      .populate("paymentId")
      .populate("deliveryRider");

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
      .populate("deliveryRider", "name phone")
      .populate("items.store", "name address");

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
