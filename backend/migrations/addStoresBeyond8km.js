import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";

dotenv.config();

// User location: 31.25198291991715, 75.70455379143716

// Update 2 stores to be beyond 8km (outside delivery range)
const storesBeyond8km = {
  "GreenThumb Garden Center": {
    latitude: 31.185,
    longitude: 75.62,
    // Distance: ~8.5 km (beyond delivery range)
  },
  "Artisan Bakery & Cafe": {
    latitude: 31.325,
    longitude: 75.785,
    // Distance: ~9.2 km (beyond delivery range)
  },
};

const updateStoresBeyondRange = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/store2door",
    );
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;

    for (const [storeName, coords] of Object.entries(storesBeyond8km)) {
      const result = await Store.updateOne(
        { name: storeName },
        {
          $set: {
            "address.latitude": coords.latitude,
            "address.longitude": coords.longitude,
          },
        },
      );

      if (result.matchedCount > 0) {
        console.log(`✅ Updated: ${storeName}`);
        console.log(`   Coordinates: ${coords.latitude}, ${coords.longitude}`);
        console.log(`   Status: BEYOND DELIVERY RANGE (>8 km)`);
        updatedCount++;
      } else {
        console.log(`❌ Store not found: ${storeName}`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Updated: ${updatedCount} stores to be beyond 8km`);
    console.log(`   ⚠️  These stores will NOT appear in deliverable results`);
    console.log(`   📍 Max delivery distance: 7 km`);
  } catch (error) {
    console.error("❌ Error updating store coordinates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the migration
updateStoresBeyondRange();
