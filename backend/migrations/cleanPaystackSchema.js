import mongoose from "mongoose";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";
import PlatformFinancials from "../models/PlatformFinancials.js";

dotenv.config();

const cleanDatabase = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");

    // Delete Payment records
    console.log("\n🗑️  Deleting Payment records...");
    const paymentResult = await Payment.deleteMany({});
    console.log(`✅ Deleted ${paymentResult.deletedCount} Payment records`);

    // Delete Order records
    console.log("\n🗑️  Deleting Order records...");
    const orderResult = await Order.deleteMany({});
    console.log(`✅ Deleted ${orderResult.deletedCount} Order records`);

    // Delete Transaction records
    console.log("\n🗑️  Deleting Transaction records...");
    const transactionResult = await Transaction.deleteMany({});
    console.log(
      `✅ Deleted ${transactionResult.deletedCount} Transaction records`,
    );

    // Delete PlatformFinancial records
    console.log("\n🗑️  Deleting PlatformFinancials records...");
    const platformFinancialResult = await PlatformFinancials.deleteMany({});
    console.log(
      `✅ Deleted ${platformFinancialResult.deletedCount} PlatformFinancials records`,
    );

    console.log("\n✨ Database cleanup completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Payments deleted: ${paymentResult.deletedCount}`);
    console.log(`   - Orders deleted: ${orderResult.deletedCount}`);
    console.log(`   - Transactions deleted: ${transactionResult.deletedCount}`);
    console.log(
      `   - Platform Financials deleted: ${platformFinancialResult.deletedCount}`,
    );

    await mongoose.connection.close();
    console.log("\n✅ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
    process.exit(1);
  }
};

cleanDatabase();
