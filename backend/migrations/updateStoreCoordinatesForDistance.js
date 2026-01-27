import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";

dotenv.config();

// User location: 31.25198291991715, 75.70455379143716

// Updated coordinates to create distance distribution
const updatedStoreCoordinates = {
  // STORES WITHIN 5 KM (9 stores)
  "Fresh Market Express": {
    latitude: 31.2587571435273,
    longitude: 75.69652739254981,
    // Distance: ~1.2 km
  },
  "TechHub Electronics": {
    latitude: 31.255457878363444,
    longitude: 75.69480113494721,
    // Distance: ~1.4 km
  },
  "HealthPlus Pharmacy": {
    latitude: 31.262847599999986,
    longitude: 75.70308284213986,
    // Distance: ~1.5 km
  },
  "FitZone Sports": {
    latitude: 31.25668276757237,
    longitude: 75.69151691895972,
    // Distance: ~1.8 km
  },
  "HomeStyle Furnishings": {
    latitude: 31.254320172708592,
    longitude: 75.69911412522612,
    // Distance: ~0.6 km
  },
  "PawPals Pet Store": {
    latitude: 31.26815428048833,
    longitude: 75.7039299511004,
    // Distance: ~1.8 km
  },
  "AutoParts Express": {
    latitude: 31.255457878363444,
    longitude: 75.69480113494721,
    // Distance: ~1.4 km
  },
  "Organic Roots Market": {
    latitude: 31.26428672490753,
    longitude: 75.69526970367917,
    // Distance: ~1.6 km
  },
  "QuickStop Convenience": {
    latitude: 31.26923253538051,
    longitude: 75.70126655791955,
    // Distance: ~2.0 km
  },

  // STORES BETWEEN 5.1-7 KM (6 stores)
  "StyleHub Fashion": {
    latitude: 31.2985,
    longitude: 75.698,
    // Distance: ~5.3 km
  },
  "BookWorm Corner": {
    latitude: 31.205,
    longitude: 75.712,
    // Distance: ~5.5 km
  },
  "BeautyBliss Salon Supply": {
    latitude: 31.247977850456564,
    longitude: 75.765,
    // Distance: ~5.8 km
  },
  "ToyBox Kingdom": {
    latitude: 31.297,
    longitude: 75.728,
    // Distance: ~6.2 km
  },
  "GreenThumb Garden Center": {
    latitude: 31.2085,
    longitude: 75.685,
    // Distance: ~6.5 km
  },
  "Artisan Bakery & Cafe": {
    latitude: 31.203,
    longitude: 75.73,
    // Distance: ~6.8 km
  },
};

const updateStoreCoordinates = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/door2door",
    );
    console.log("✅ Connected to MongoDB");

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [storeName, coords] of Object.entries(updatedStoreCoordinates)) {
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
        updatedCount++;
      } else {
        console.log(`❌ Store not found: ${storeName}`);
        notFoundCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Updated: ${updatedCount} stores`);
    console.log(`   ❌ Not found: ${notFoundCount} stores`);
    console.log("\n🎯 Distance Distribution:");
    console.log(`   Within 5 km: 9 stores`);
    console.log(`   Between 5.1-7 km: 6 stores`);
  } catch (error) {
    console.error("❌ Error updating store coordinates:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the migration
updateStoreCoordinates();
