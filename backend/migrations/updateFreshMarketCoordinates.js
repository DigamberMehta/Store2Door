import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";

dotenv.config();

const updateFreshMarketCoordinates = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/store2door",
    );
    console.log("✅ Connected to MongoDB");

    const result = await Store.updateOne(
      { name: "Fresh Market Express" },
      {
        $set: {
          "address.latitude": 31.264594,
          "address.longitude": 75.699767,
        },
      },
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Updated: Fresh Market Express`);
      console.log(`   New Coordinates: 31.264594, 75.699767`);
      console.log(`   Modified: ${result.modifiedCount} document(s)`);
    } else {
      console.log(`❌ Fresh Market Express store not found`);
    }
  } catch (error) {
    console.error("❌ Error updating Fresh Market Express coordinates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the migration
updateFreshMarketCoordinates();
