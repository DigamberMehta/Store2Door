import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";
import Store from "./models/Store.js";
import User from "./models/User.js";

dotenv.config();

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB Atlas");

  const user = await User.findOne({ email: "digambermehta2603@gmail.com" });
  if (!user) {
    console.log("User not found");
    process.exit(0);
  }

  console.log("User storeId:", user.storeId);

  // Get actual order stats (ONLY SUCCEEDED PAYMENTS)
  const orderCount = await Order.countDocuments({
    storeId: user.storeId,
    paymentStatus: "succeeded",
  });

  const revenueResult = await Order.aggregate([
    {
      $match: {
        storeId: new mongoose.Types.ObjectId(user.storeId),
        paymentStatus: "succeeded",
      },
    },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);

  const actualRevenue = revenueResult[0]?.totalRevenue || 0;

  console.log("\n=== CURRENT STATE ===");
  console.log("Actual succeeded orders:", orderCount);
  console.log(
    "Actual total revenue (succeeded only): R" + actualRevenue.toFixed(2),
  );

  const store = await Store.findById(user.storeId);
  console.log("\nStore stats (before fix):");
  console.log("  totalOrders:", store.stats.totalOrders);
  console.log("  totalRevenue:", store.stats.totalRevenue);

  // Fix the stats
  console.log("\n=== FIXING STATS ===");
  store.stats.totalOrders = orderCount;
  store.stats.totalRevenue = actualRevenue;

  // Ensure commissionRate is set (required field)
  if (!store.commissionRate) {
    store.commissionRate = 20; // Default 20%
  }

  await store.save({ validateBeforeSave: false }); // Skip validation for this fix

  console.log("\n✅ Store stats updated successfully!");
  console.log("New stats (only succeeded payments):");
  console.log("  totalOrders:", orderCount);
  console.log("  totalRevenue: R" + actualRevenue.toFixed(2));

  process.exit(0);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
