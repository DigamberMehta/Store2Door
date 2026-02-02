import { asyncHandler } from "../middleware/validation.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import SupportTicket from "../models/SupportTicket.js";
import {
  sendSupportTicketEmail,
  sendSupportTicketConfirmationEmail,
} from "../config/mailer.js";

/**
 * @desc    Submit a support ticket / contact us form
 * @route   POST /api/support/ticket
 * @access  Private (authenticated users)
 */
export const submitSupportTicket = asyncHandler(async (req, res) => {
  const { orderId, productName, issue, imageUrl } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!issue || issue.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Please describe your issue",
    });
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  let orderNumber = null;

  // If orderId is provided, validate it belongs to the user
  if (orderId) {
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or does not belong to you",
      });
    }

    orderNumber = order.orderNumber;
  }

  // Create and save support ticket
  const supportTicket = await SupportTicket.create({
    customerId: userId,
    orderId: orderId || null,
    orderNumber,
    productName,
    issue: issue.trim(),
    issueImageUrl: imageUrl,
    status: "open",
  });

  // Prepare ticket data for emails
  const ticketData = {
    userName: user.name,
    userEmail: user.email,
    ticketNumber: supportTicket.ticketNumber,
    orderNumber,
    productName,
    issue: issue.trim(),
    imageUrl,
  };

  // Send support team notification (non-blocking)
  try {
    await sendSupportTicketEmail(ticketData);
    console.log(
      `Support ticket ${supportTicket.ticketNumber} sent to support team`,
    );
  } catch (emailError) {
    console.error("Error sending support team notification:", emailError);
  }

  // Send customer confirmation email (non-blocking)
  try {
    await sendSupportTicketConfirmationEmail(ticketData);
    console.log(`Ticket confirmation sent to ${user.email}`);
  } catch (emailError) {
    console.error("Error sending customer confirmation:", emailError);
  }

  res.status(200).json({
    success: true,
    message:
      "Your support ticket has been submitted successfully. We'll get back to you soon!",
    data: {
      ticketNumber: supportTicket.ticketNumber,
    },
  });
});

/**
 * @desc    Get user's orders for support form
 * @route   GET /api/support/my-orders
 * @access  Private (authenticated users)
 */
export const getMyOrdersForSupport = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all user orders with basic info and populate product details
  const orders = await Order.find({
    customerId: userId,
  })
    .select("orderNumber items status createdAt total")
    .populate({
      path: "items.productId",
      select: "images name",
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Format orders for dropdown
  const formattedOrders = orders.map((order) => ({
    _id: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    date: order.createdAt,
    total: order.total,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      image: item.productId?.images?.[0] || null,
    })),
  }));

  res.status(200).json({
    success: true,
    data: formattedOrders,
  });
});
