import mongoose from "mongoose";
import Order from "../models/Order.js";
import dotenv from "dotenv";

dotenv.config();

const migrate = async () => {
  try {
    console.log("Starting migration: Update pending orders to placed status");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all orders with status 'pending' and paymentStatus 'paid'
    const pendingOrders = await Order.find({
      status: "pending",
      paymentStatus: "paid",
    });

    console.log(
      `Found ${pendingOrders.length} paid orders with pending status`,
    );

    let updatedCount = 0;
    let errorCount = 0;

    // Update each order
    for (const order of pendingOrders) {
      try {
        order.status = "placed";

        // Add tracking history entry
        order.trackingHistory.push({
          status: "placed",
          updatedAt: new Date(),
          notes: "Order status migrated from pending to placed",
        });

        await order.save();
        updatedCount++;

        console.log(
          `✓ Updated order ${order.orderNumber || order._id} to placed status`,
        );
      } catch (error) {
        errorCount++;
        console.error(
          `✗ Failed to update order ${order.orderNumber || order._id}:`,
          error.message,
        );
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total orders found: ${pendingOrders.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log("========================\n");

    // Also update orders with pending status and no payment (keep them as pending)
    const pendingNoPay = await Order.countDocuments({
      status: "pending",
      paymentStatus: { $ne: "paid" },
    });

    console.log(
      `Note: ${pendingNoPay} orders remain in pending status (payment not completed)`,
    );

    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

migrate();
