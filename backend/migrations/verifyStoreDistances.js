import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";
import { calculateDistance } from "../utils/distanceCalculator.js";

dotenv.config();

// User location
const userLat = 31.25198291991715;
const userLon = 75.70455379143716;

const verifyStoreDistances = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/door2door",
    );
    console.log("✅ Connected to MongoDB");

    // Fetch all stores
    const stores = await Store.find({ isActive: true })
      .select("name address")
      .lean();

    console.log("\n📍 USER LOCATION:");
    console.log(`   Coordinates: ${userLat}, ${userLon}`);
    console.log(`   Location: Phagwara, Punjab, India (Near LPU)\n`);

    // Calculate distances
    const storesWithDistance = stores
      .map((store) => {
        const storeLat = store.address?.latitude;
        const storeLon = store.address?.longitude;

        if (!storeLat || !storeLon) {
          return null;
        }

        const distance = calculateDistance(
          userLat,
          userLon,
          storeLat,
          storeLon,
        );

        return {
          name: store.name,
          address: store.address,
          distance: distance,
          distanceRounded: Math.round(distance * 10) / 10,
        };
      })
      .filter((store) => store !== null && store.distance <= 7); // Filter by max delivery distance

    // Sort by distance
    storesWithDistance.sort((a, b) => a.distance - b.distance);

    // Separate into two groups
    const within5km = storesWithDistance.filter((s) => s.distance <= 5);
    const between5and7km = storesWithDistance.filter(
      (s) => s.distance > 5 && s.distance <= 7,
    );

    console.log("🏪 STORES WITHIN 5 KM:");
    console.log("======================\n");
    within5km.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Distance: ${store.distanceRounded} km`);
      console.log(
        `   Coordinates: ${store.address.latitude}, ${store.address.longitude}`,
      );
      console.log(
        `   Address: ${store.address.street}, ${store.address.city}\n`,
      );
    });

    console.log("\n🏪 STORES BETWEEN 5.1-7 KM:");
    console.log("===========================\n");
    between5and7km.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Distance: ${store.distanceRounded} km`);
      console.log(
        `   Coordinates: ${store.address.latitude}, ${store.address.longitude}`,
      );
      console.log(
        `   Address: ${store.address.street}, ${store.address.city}\n`,
      );
    });

    console.log("📊 SUMMARY:");
    console.log(`   Within 5 km: ${within5km.length} stores`);
    console.log(`   Between 5.1-7 km: ${between5and7km.length} stores`);
    console.log(`   Total deliverable: ${storesWithDistance.length} stores`);

    // Write to file for location.txt update
    const output = {
      userLocation: { lat: userLat, lon: userLon },
      within5km,
      between5and7km,
      summary: {
        within5km: within5km.length,
        between5and7km: between5and7km.length,
        total: storesWithDistance.length,
      },
    };

    const fs = await import("fs");
    fs.writeFileSync(
      "./migrations/store-distances-result.json",
      JSON.stringify(output, null, 2),
    );
    console.log(
      "\n💾 Results saved to: migrations/store-distances-result.json",
    );
  } catch (error) {
    console.error("❌ Error verifying store distances:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run verification
verifyStoreDistances();
