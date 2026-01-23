import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import yocoService from "../config/yoco.js";

/**
 * Create checkout session
 * POST /api/payments/checkout
 */
export const createCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      orderId,
      amount,
      currency = "ZAR",
      successUrl,
      cancelUrl,
      failureUrl,
    } = req.body;

    // Validate required fields
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID and amount are required",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, customerId: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify amount matches order total
    if (Math.abs(amount - order.total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order total",
      });
    }

    // Create payment record FIRST so we can include paymentId in success URL
    const payment = new Payment({
      orderId,
      userId,
      method: "yoco_card",
      amount,
      currency,
      status: "pending",
      description: `Payment for order ${orderId}`,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await payment.save();

    // Create checkout session with Yoco - include paymentId in URLs
    const constructUrl = (baseUrl, params) => {
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return url.toString();
    };

    const baseSuccessUrl =
      successUrl || `${process.env.FRONTEND_URL}/payment/success`;
    const baseCancelUrl = cancelUrl || `${process.env.FRONTEND_URL}/payment`;
    const baseFailureUrl =
      failureUrl || `${process.env.FRONTEND_URL}/payment/failure`;

    const urlParams = {
      orderId: orderId.toString(),
      paymentId: payment._id.toString(),
    };

    const checkoutData = {
      amount,
      currency,
      successUrl: constructUrl(baseSuccessUrl, urlParams),
      cancelUrl: constructUrl(baseCancelUrl, urlParams),
      failureUrl: constructUrl(baseFailureUrl, urlParams),
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        paymentId: payment._id.toString(),
      },
    };

    const yocoResponse = await yocoService.createCheckout(checkoutData);

    console.log(
      "Yoco createCheckout response:",
      JSON.stringify(yocoResponse, null, 2),
    );

    if (!yocoResponse.success) {
      // Delete the payment record if checkout creation fails
      await Payment.findByIdAndDelete(payment._id);

      return res.status(500).json({
        success: false,
        message: "Failed to create checkout session",
        error: yocoResponse.error,
      });
    }

    // Update payment with checkout ID
    payment.yocoCheckoutId = yocoResponse.checkoutId;
    await payment.save();

    // Update order with payment reference
    order.paymentId = payment._id;
    order.paymentStatus = "pending";
    order.paymentMethod = "yoco_card";
    await order.save();

    res.json({
      success: true,
      payment,
      redirectUrl: yocoResponse.redirectUrl,
      checkoutId: yocoResponse.checkoutId,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create checkout session",
      error: error.message,
    });
  }
};

/**
 * Create payment with token (deprecated - kept for backward compatibility)
 * POST /api/payments/create
 */
export const createPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, token, amount, currency = "ZAR" } = req.body;

    // Validate required fields
    if (!orderId || !token || !amount) {
      return res.status(400).json({
        success: false,
        message: "Order ID, payment token, and amount are required",
      });
    }

    // Verify order
    const order = await Order.findOne({ _id: orderId, customerId: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify amount
    if (Math.abs(amount - order.total) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match order total",
      });
    }

    // Create payment record
    const payment = new Payment({
      orderId,
      userId,
      method: "yoco_card",
      amount,
      currency,
      status: "processing",
      description: `Payment for order ${order.orderNumber}`,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      metadata: {
        orderNumber: order.orderNumber,
      },
    });

    await payment.save();

    // Create charge with Yoco
    const chargeData = {
      token,
      amountInCents: yocoService.formatAmount(amount),
      currency,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        paymentId: payment._id.toString(),
      },
    };

    const yocoResponse = await yocoService.createCharge(chargeData);

    if (!yocoResponse.success) {
      // Mark payment as failed
      await payment.markAsFailed(
        yocoResponse.error.code || "charge_failed",
        yocoResponse.error.message || "Failed to process payment",
      );

      // Log attempt
      await payment.addAttempt(
        "failed",
        yocoResponse.error.message,
        yocoResponse.error,
      );

      return res.status(400).json({
        success: false,
        message: "Payment failed",
        error: yocoResponse.error,
      });
    }

    // Payment successful
    const yocoCharge = yocoResponse.data;

    // Update payment with success details
    await payment.markAsSucceeded(
      yocoCharge.id,
      yocoCharge.id, // transactionId
      {
        lastFour: yocoCharge.card?.last4,
        brand: yocoCharge.card?.brand?.toLowerCase(),
        expiryMonth: yocoCharge.card?.expiryMonth,
        expiryYear: yocoCharge.card?.expiryYear,
      },
    );

    payment.yocoChargeId = yocoCharge.id;
    payment.receiptUrl = yocoCharge.receiptUrl;
    payment.metadata = { ...payment.metadata, yocoCharge };
    await payment.save();

    // Log successful attempt
    await payment.addAttempt("succeeded", null, yocoCharge);

    // Update order
    order.paymentId = payment._id;
    order.paymentStatus = "succeeded";
    order.paymentMethod = "yoco_card";
    order.status = "confirmed";
    await order.save();

    // Mark coupon as used if applied
    if (order.appliedCoupon?.couponId) {
      await Coupon.findByIdAndUpdate(order.appliedCoupon.couponId, {
        $inc: { usedCount: 1 },
        $push: { usedBy: userId },
      });
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { userId },
      { items: [], subtotal: 0, totalItems: 0 },
    );

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: payment.status,
        receiptUrl: payment.receiptUrl,
      },
    });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

/**
 * Confirm payment status
 * GET /api/payments/:paymentId/confirm
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If already succeeded, return current status
    if (payment.status === "succeeded") {
      return res.json({
        success: true,
        data: payment,
      });
    }

    // Check with Yoco if payment has yocoCheckoutId
    if (payment.yocoCheckoutId) {
      const yocoResponse = await yocoService.getCheckout(
        payment.yocoCheckoutId,
      );

      console.log(
        "Yoco getCheckout response:",
        JSON.stringify(yocoResponse, null, 2),
      );

      if (yocoResponse.success) {
        const yocoCheckout = yocoResponse.data;
        console.log("Yoco checkout status:", yocoCheckout.status);
        console.log(
          "Full checkout data:",
          JSON.stringify(yocoCheckout, null, 2),
        );

        // Update payment status based on Yoco response
        // Yoco uses "complete" for successful payments in the new API
        if (
          yocoCheckout.status === "completed" ||
          yocoCheckout.status === "complete" ||
          yocoCheckout.status === "successful" ||
          yocoCheckout.status === "succeeded"
        ) {
          console.log("Payment successful! Updating order and payment...");

          await payment.markAsSucceeded(yocoCheckout.id, yocoCheckout.id, {
            lastFour:
              yocoCheckout.card?.last4 || yocoCheckout.metadata?.cardLast4,
            brand:
              yocoCheckout.card?.brand?.toLowerCase() ||
              yocoCheckout.metadata?.cardBrand,
          });

          payment.metadata = { ...payment.metadata, yocoCheckout };
          await payment.save();

          // Update order
          const order = await Order.findById(payment.orderId);
          if (order) {
            order.paymentStatus = "succeeded";
            order.status = "confirmed";
            await order.save();
            console.log("Order updated:", order.orderNumber);
          }

          // Clear user's cart
          await Cart.findOneAndUpdate(
            { userId: payment.userId },
            { items: [], subtotal: 0, totalItems: 0 },
          );
          console.log("Cart cleared for user:", payment.userId);
        } else if (
          yocoCheckout.status === "cancelled" ||
          yocoCheckout.status === "failed"
        ) {
          console.log("Payment failed/cancelled:", yocoCheckout.status);
          await payment.markAsFailed(
            yocoCheckout.failureCode || "payment_cancelled",
            yocoCheckout.failureReason || `Payment ${yocoCheckout.status}`,
          );

          const order = await Order.findById(payment.orderId);
          if (order) {
            order.paymentStatus = "failed";
            await order.save();
          }
        } else {
          console.log("Payment still pending, status:", yocoCheckout.status);
        }
      } else {
        console.error("Failed to get checkout from Yoco:", yocoResponse.error);
      }
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: error.message,
    });
  }
};

/**
 * Handle Yoco webhooks
 * POST /api/payments/webhook
 */
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-yoco-signature"];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature
    const isValid = yocoService.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
    }

    const event = req.body;
    const { type, payload: eventPayload } = event;

    // Find payment by yocoCheckoutId
    let payment = await Payment.findOne({
      yocoCheckoutId: eventPayload.id,
    });

    if (!payment) {
      console.log("Payment not found for webhook event:", event);
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Log webhook event
    await payment.addWebhookEvent(type, eventPayload);

    // Handle different webhook events
    switch (type) {
      case "payment.succeeded":
      case "checkout.succeeded":
        if (payment.status !== "succeeded") {
          await payment.markAsSucceeded(eventPayload.id, eventPayload.id, {
            lastFour: eventPayload.card?.last4,
            brand: eventPayload.card?.brand?.toLowerCase(),
          });

          payment.metadata = { ...payment.metadata, webhookData: eventPayload };
          await payment.save();

          // Update order
          const order = await Order.findById(payment.orderId);
          if (order) {
            order.paymentStatus = "succeeded";
            order.status = "confirmed";
            await order.save();

            // Mark coupon as used
            if (order.appliedCoupon?.couponId) {
              await Coupon.findByIdAndUpdate(order.appliedCoupon.couponId, {
                $inc: { usedCount: 1 },
                $push: { usedBy: payment.userId },
              });
            }

            // Clear cart
            await Cart.findOneAndUpdate(
              { userId: payment.userId },
              { items: [], subtotal: 0, totalItems: 0 },
            );
          }
        }
        break;

      case "payment.failed":
      case "checkout.failed":
        await payment.markAsFailed(
          eventPayload.failureCode || "payment_failed",
          eventPayload.failureMessage || "Payment failed",
        );

        // Update order
        const failedOrder = await Order.findById(payment.orderId);
        if (failedOrder) {
          failedOrder.paymentStatus = "failed";
          await failedOrder.save();
        }
        break;

      case "refund.succeeded":
        const refundData = {
          refundId: eventPayload.id,
          amount: eventPayload.amount / 100, // Yoco sends in cents
          status: "succeeded",
          yocoRefundId: eventPayload.id,
          processedAt: new Date(),
        };
        await payment.addRefund(refundData);

        // Update order
        const refundedOrder = await Order.findById(payment.orderId);
        if (refundedOrder) {
          refundedOrder.paymentStatus = payment.status;
          await refundedOrder.save();
        }
        break;

      default:
        console.log("Unhandled webhook event type:", type);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

/**
 * Get payment details
 * GET /api/payments/:paymentId
 */
export const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({ _id: paymentId, userId }).populate(
      "orderId",
      "orderNumber total status",
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payment",
      error: error.message,
    });
  }
};

/**
 * Get user's payment history
 * GET /api/payments
 */
export const getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("orderId", "orderNumber total status");

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve payments",
      error: error.message,
    });
  }
};

// Refund functionality removed for security reasons
// Refunds should be handled by admin panel with proper verification
