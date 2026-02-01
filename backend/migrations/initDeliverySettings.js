import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliverySettings from "../models/DeliverySettings.js";

dotenv.config();

const initializeDeliverySettings = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/store2door",
    );
    console.log("✅ Connected to MongoDB");

    // Check if settings already exist
    const existingSettings = await DeliverySettings.findOne({ isActive: true });

    if (existingSettings) {
      console.log("⚠️  Delivery settings already exist:");
      console.log(
        "   Max Distance:",
        existingSettings.maxDeliveryDistance,
        "km",
      );
      console.log("   Distance Tiers:");
      existingSettings.distanceTiers.forEach((tier) => {
        console.log(
          `     - Up to ${tier.maxDistance}km: ${existingSettings.currency}${tier.charge}`,
        );
      });
      return;
    }

    // Create default settings
    const defaultSettings = await DeliverySettings.create({
      distanceTiers: [
        {
          maxDistance: 5,
          charge: 30,
        },
        {
          maxDistance: 7,
          charge: 35,
        },
      ],
      maxDeliveryDistance: 7,
      currency: "R",
      isActive: true,
    });

    console.log("🎉 Default delivery settings created successfully:");
    console.log("   Max Distance:", defaultSettings.maxDeliveryDistance, "km");
    console.log("   Distance Tiers:");
    defaultSettings.distanceTiers.forEach((tier) => {
      console.log(
        `     - Up to ${tier.maxDistance}km: ${defaultSettings.currency}${tier.charge}`,
      );
    });
  } catch (error) {
    console.error("❌ Error initializing delivery settings:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the initialization
initializeDeliverySettings();
