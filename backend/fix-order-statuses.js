import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";

dotenv.config();

async function updateOrderStatuses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all orders that have status "confirmed" and update to "placed"
    const result = await Order.updateMany(
      { status: "confirmed" },
      {
        $set: { status: "placed" },
        $push: {
          trackingHistory: {
            status: "placed",
            updatedAt: new Date(),
            notes:
              "Order status updated from confirmed to placed - ready for store confirmation",
          },
        },
      },
    );

    console.log(
      `Updated ${result.modifiedCount} orders from "confirmed" to "placed"`,
    );

    // Show sample of updated orders
    const sampleOrders = await Order.find({ status: "placed" })
      .limit(5)
      .select("_id orderNumber status");
    console.log(
      "Sample updated orders:",
      JSON.stringify(sampleOrders, null, 2),
    );

    await mongoose.disconnect();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error);
  }
}

updateOrderStatuses();
