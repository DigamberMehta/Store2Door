import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Models
import User from "../models/User.js";
import Store from "../models/Store.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import CustomerProfile from "../models/CustomerProfile.js";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";
import Category from "../models/Category.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/store2door";

async function syncSchema() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Clean up removed fields from Users
    console.log("\n📝 Syncing User schema...");
    await User.updateMany(
      {},
      {
        $unset: {
          emergencyContact: 1,
          emergencyContactPhone: 1,
          bankAccount: 1,
          bankAccountNumber: 1,
          bankCode: 1,
          ifscCode: 1,
          accountHolderName: 1,
          upiId: 1,
          accountNumber: 1,
          sortCode: 1,
          routingNumber: 1,
        },
      },
    );
    console.log("✅ User schema synced");

    // 2. Clean up removed fields from Stores
    console.log("\n📝 Syncing Store schema...");
    await Store.updateMany(
      {},
      {
        $unset: {
          vehicle: 1,
          vehicleNumber: 1,
          vehicleType: 1,
          insuranceProvider: 1,
          insuranceDocument: 1,
          insurance: 1,
          workSchedule: 1,
          serviceAreas: 1,
        },
      },
    );
    console.log("✅ Store schema synced");

    // 3. Clean up removed fields from Products
    console.log("\n📝 Syncing Product schema...");
    await Product.updateMany(
      {},
      {
        $unset: {
          keyFeatures: 1,
        },
      },
    );
    console.log("✅ Product schema synced");

    // 4. Clean up removed fields from Orders
    console.log("\n📝 Syncing Order schema...");
    await Order.updateMany(
      {},
      {
        $unset: {
          codOrderDetails: 1,
        },
      },
    );
    console.log("✅ Order schema synced");

    // 5. Ensure required indexes exist for all models
    console.log("\n📝 Creating indexes...");
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ phone: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });

    await Store.collection.createIndex({ slug: 1 }, { unique: true });
    await Store.collection.createIndex({ managerId: 1 });
    await Store.collection.createIndex({ isActive: 1 });

    await Product.collection.createIndex({ slug: 1 }, { unique: true });
    await Product.collection.createIndex({ storeId: 1 });
    await Product.collection.createIndex({ categoryId: 1 });

    await Order.collection.createIndex({ orderNumber: 1 }, { unique: true });
    await Order.collection.createIndex({ customerId: 1 });
    await Order.collection.createIndex({ status: 1 });

    await Payment.collection.createIndex(
      { paymentNumber: 1 },
      { unique: true },
    );
    await Payment.collection.createIndex({ orderId: 1 });
    await Payment.collection.createIndex({ status: 1 });

    await Category.collection.createIndex({ slug: 1 }, { unique: true });
    await Category.collection.createIndex({ parentId: 1 });

    console.log("✅ Indexes created successfully");

    // 6. Validate data integrity
    console.log("\n📊 Data Validation...");
    const userCount = await User.countDocuments();
    const storeCount = await Store.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const paymentCount = await Payment.countDocuments();

    console.log(`  Users: ${userCount}`);
    console.log(`  Stores: ${storeCount}`);
    console.log(`  Products: ${productCount}`);
    console.log(`  Orders: ${orderCount}`);
    console.log(`  Payments: ${paymentCount}`);

    console.log("\n✅ Schema migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

syncSchema();
