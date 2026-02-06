import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import paystackService from "../config/paystack.js";
import { sendOrderConfirmationEmail } from "../config/mailer.js";

/**
 * Initialize Paystack payment transaction
 * POST /api/payments/paystack/initialize
 */
export const initializePaystackPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, amount, currency = "ZAR", callbackUrl } = req.body;

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

    // Create payment record
    const payment = new Payment({
      orderId,
      userId,
      method: "paystack_card",
      amount,
      currency,
      status: "pending",
      description: `Payment for order ${order.orderNumber || orderId}`,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    await payment.save();

    // Generate unique reference
    const reference = paystackService.generateReference();

    // Initialize transaction with Paystack
    const baseCallbackUrl =
      callbackUrl || `${process.env.FRONTEND_URL}/payment/verify`;
    const callback = `${baseCallbackUrl}?orderId=${orderId}&paymentId=${payment._id}&reference=${reference}`;

    const transactionData = {
      email: req.user.email,
      amount,
      currency,
      reference,
      callback_url: callback,
      metadata: {
        orderId: orderId.toString(),
        userId: userId.toString(),
        paymentId: payment._id.toString(),
        orderNumber: order.orderNumber,
        custom_fields: [
          {
            display_name: "Order Number",
            variable_name: "order_number",
            value: order.orderNumber || orderId,
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: req.user.name,
          },
        ],
      },
    };

    const paystackResponse =
      await paystackService.initializeTransaction(transactionData);

    if (!paystackResponse.success) {
      // Delete the payment record if initialization fails
      await Payment.findByIdAndDelete(payment._id);

      return res.status(500).json({
        success: false,
        message: "Failed to initialize payment",
        error: paystackResponse.error,
      });
    }

    // Update payment with Paystack reference
    payment.paystackReference = paystackResponse.reference;
    payment.paystackAccessCode = paystackResponse.access_code;
    await payment.save();

    // Update order with payment reference
    order.paymentId = payment._id;
    order.paymentStatus = "pending";
    order.paymentMethod = "paystack_card";
    await order.save();

    res.json({
      success: true,
      payment: {
        id: payment._id,
        reference: paystackResponse.reference,
        accessCode: paystackResponse.access_code,
      },
      authorization_url: paystackResponse.authorization_url,
      reference: paystackResponse.reference,
    });
  } catch (error) {
    console.error("Initialize Paystack payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
};

/**
 * Verify Paystack payment transaction
 * GET /api/payments/paystack/verify/:reference
 */
export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const { paymentId } = req.query;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Transaction reference is required",
      });
    }

    // Verify transaction with Paystack
    const verificationResponse =
      await paystackService.verifyTransaction(reference);

    if (!verificationResponse.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to verify transaction",
        error: verificationResponse.error,
      });
    }

    // Find payment record
    const payment = await Payment.findOne({
      $or: [{ _id: paymentId }, { paystackReference: reference }],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    const transactionData = verificationResponse.data;

    // Update payment status
    if (transactionData.status === "success") {
      payment.status = "completed";
      payment.paystackPaymentId = transactionData.id;
      payment.paystackResponse = transactionData;
      payment.paidAt = new Date(transactionData.paid_at);
      await payment.save();

      // Update order status
      const order = await Order.findById(payment.orderId)
        .populate("customerId", "name email phone")
        .populate("storeId", "name address contactInfo");

      if (order) {
        order.paymentStatus = "paid";
        // Automatically update status to "placed" when payment is confirmed
        if (order.status === "pending") {
          order.status = "placed";
          order.trackingHistory.push({
            status: "placed",
            updatedAt: new Date(),
            notes: "Order placed - payment confirmed",
          });
        }
        await order.save();

        // Send payment confirmation email
        try {
          await sendOrderConfirmationEmail(
            order,
            order.customerId.email,
            order.customerId.name,
          );
          console.log(
            `Order confirmation email sent to ${order.customerId.email}`,
          );
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      return res.json({
        success: true,
        message: "Payment verified successfully",
        payment: {
          id: payment._id,
          status: payment.status,
          amount: payment.amount,
          reference: payment.paystackReference,
        },
        order: order
          ? {
              id: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              paymentStatus: order.paymentStatus,
            }
          : null,
      });
    } else {
      payment.status = "failed";
      payment.paystackResponse = transactionData;
      await payment.save();

      if (payment.orderId) {
        const order = await Order.findById(payment.orderId);
        if (order) {
          order.paymentStatus = "failed";
          order.status = "payment_failed";
          await order.save();
        }
      }

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
        payment: {
          id: payment._id,
          status: payment.status,
          reference: payment.paystackReference,
        },
      });
    }
  } catch (error) {
    console.error("Verify Paystack payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
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
