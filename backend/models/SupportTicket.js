import mongoose from "mongoose";

// Support Ticket sub-schema for updates/responses
const ticketUpdateSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    trim: true,
  },
  attachmentUrl: String,
  createdBy: {
    type: String,
    enum: ["customer", "support"],
    default: "customer",
  },
});

// Main Support Ticket Schema
const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer ID is required"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    orderNumber: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    issue: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
      maxlength: 2000,
    },
    issueImageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "order_issue",
        "product_quality",
        "delivery_issue",
        "payment_issue",
        "account_issue",
        "other",
      ],
      default: "other",
    },
    updates: [ticketUpdateSchema],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    resolutionDate: Date,
  },
  {
    timestamps: true,
  },
);

// Auto-generate ticket number before saving
supportTicketSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Generate ticket number in format: TKT-TIMESTAMP-RANDOM
    const timestamp = Date.now();
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.ticketNumber = `TKT-${timestamp}-${randomCode}`;

    // Ensure uniqueness (retry if needed)
    const existingTicket = await SupportTicket.findOne({
      ticketNumber: this.ticketNumber,
    });

    if (existingTicket) {
      // Very unlikely, but retry once
      const randomCode2 = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      this.ticketNumber = `TKT-${timestamp}-${randomCode2}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Index for efficient queries
supportTicketSchema.index({ customerId: 1, createdAt: -1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ orderId: 1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

export default SupportTicket;
