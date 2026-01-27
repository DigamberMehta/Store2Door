import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";
import { calculateDistance } from "../utils/distanceCalculator.js";

dotenv.config();

// User location
const userLat = 31.25198291991715;
const userLon = 75.70455379143716;

const verifyAllStores = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/door2door",
    );
    console.log("✅ Connected to MongoDB");

    // Fetch all stores (including inactive)
    const stores = await Store.find().select("name address isActive").lean();

    console.log("\n📍 USER LOCATION:");
    console.log(`   Coordinates: ${userLat}, ${userLon}\n`);

    // Calculate distances for all stores
    const allStoresWithDistance = stores
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
          isActive: store.isActive,
        };
      })
      .filter((store) => store !== null);

    // Sort by distance
    allStoresWithDistance.sort((a, b) => a.distance - b.distance);

    // Categorize stores
    const within5km = allStoresWithDistance.filter((s) => s.distance <= 5);
    const between5and7km = allStoresWithDistance.filter(
      (s) => s.distance > 5 && s.distance <= 7,
    );
    const beyond7km = allStoresWithDistance.filter((s) => s.distance > 7);

    console.log("🏪 STORES WITHIN 5 KM (Deliverable):");
    console.log("=====================================\n");
    within5km.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Distance: ${store.distanceRounded} km ✅`);
      console.log(
        `   Coordinates: ${store.address.latitude}, ${store.address.longitude}\n`,
      );
    });

    console.log("\n🏪 STORES BETWEEN 5-7 KM (Deliverable):");
    console.log("========================================\n");
    between5and7km.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Distance: ${store.distanceRounded} km ✅`);
      console.log(
        `   Coordinates: ${store.address.latitude}, ${store.address.longitude}\n`,
      );
    });

    console.log("\n⚠️  STORES BEYOND 7 KM (NOT Deliverable):");
    console.log("==========================================\n");
    beyond7km.forEach((store, index) => {
      console.log(`${index + 1}. ${store.name}`);
      console.log(`   Distance: ${store.distanceRounded} km ❌ TOO FAR`);
      console.log(
        `   Coordinates: ${store.address.latitude}, ${store.address.longitude}\n`,
      );
    });

    console.log("📊 SUMMARY:");
    console.log("===========");
    console.log(`   ✅ Within 5 km: ${within5km.length} stores`);
    console.log(`   ✅ Between 5-7 km: ${between5and7km.length} stores`);
    console.log(
      `   ❌ Beyond 7 km: ${beyond7km.length} stores (NOT deliverable)`,
    );
    console.log(
      `   📦 Total deliverable: ${within5km.length + between5and7km.length} stores`,
    );
    console.log(
      `   🏬 Total stores in DB: ${allStoresWithDistance.length} stores`,
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

verifyAllStores();
