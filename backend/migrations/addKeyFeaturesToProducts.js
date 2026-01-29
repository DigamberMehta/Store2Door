/**
 * Migration Script: Add Key Features to All Products
 *
 * This script adds dummy key features to all existing products
 * based on their category type (Electronics, Food, Fashion, etc.)
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";

dotenv.config();

// Category-specific dummy features
const featuresByCategory = {
  electronics: [
    { key: "Screen Size", value: "6.5 inches" },
    { key: "Battery Capacity", value: "5000mAh" },
    { key: "Storage", value: "128GB" },
    { key: "RAM", value: "8GB" },
    { key: "Camera", value: "48MP Main Camera" },
  ],
  grocery: [
    { key: "Origin", value: "South Africa" },
    { key: "Shelf Life", value: "12 months" },
    { key: "Storage Instructions", value: "Store in cool, dry place" },
    { key: "Package Size", value: "500g" },
  ],
  fashion: [
    { key: "Material Composition", value: "100% Cotton" },
    { key: "Fit Type", value: "Regular Fit" },
    { key: "Care Instructions", value: "Machine washable at 30°C" },
    { key: "Season", value: "All Season" },
  ],
  pharmacy: [
    { key: "Active Ingredient", value: "Paracetamol 500mg" },
    { key: "Dosage Form", value: "Tablets" },
    { key: "Pack Size", value: "20 tablets" },
    { key: "Usage", value: "Adults: 1-2 tablets every 4-6 hours" },
  ],
  beauty: [
    { key: "Skin Type", value: "All skin types" },
    { key: "Volume", value: "50ml" },
    { key: "SPF Protection", value: "SPF 30" },
    { key: "Fragrance", value: "Fragrance-free" },
  ],
  books: [
    { key: "Author", value: "Best Selling Author" },
    { key: "Pages", value: "320 pages" },
    { key: "Publisher", value: "Leading Publishing House" },
    { key: "Language", value: "English" },
  ],
  default: [
    { key: "Quality", value: "Premium Quality" },
    { key: "Warranty", value: "1 Year Manufacturer Warranty" },
    { key: "Made In", value: "South Africa" },
    { key: "Eco-Friendly", value: "Sustainably sourced" },
  ],
};

const getCategoryType = (categoryName) => {
  const name = categoryName.toLowerCase();

  if (
    name.includes("electronic") ||
    name.includes("phone") ||
    name.includes("computer") ||
    name.includes("gadget")
  ) {
    return "electronics";
  }
  if (
    name.includes("grocery") ||
    name.includes("food") ||
    name.includes("snack") ||
    name.includes("beverage")
  ) {
    return "grocery";
  }
  if (
    name.includes("fashion") ||
    name.includes("clothing") ||
    name.includes("apparel")
  ) {
    return "fashion";
  }
  if (
    name.includes("pharmacy") ||
    name.includes("medicine") ||
    name.includes("health")
  ) {
    return "pharmacy";
  }
  if (
    name.includes("beauty") ||
    name.includes("cosmetic") ||
    name.includes("skincare")
  ) {
    return "beauty";
  }
  if (name.includes("book") || name.includes("reading")) {
    return "books";
  }

  return "default";
};

const getRandomFeatures = (categoryType, count = 3) => {
  const features =
    featuresByCategory[categoryType] || featuresByCategory.default;
  // Shuffle and pick random features
  const shuffled = [...features].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, features.length));
};

async function migrateProducts() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      // Skip if product already has key features
      if (
        product.specifications?.keyFeatures &&
        product.specifications.keyFeatures.length > 0
      ) {
        console.log(
          `⏭️  Skipping "${product.name}" - already has key features`,
        );
        skippedCount++;
        continue;
      }

      // Determine category type
      const categoryType = getCategoryType(product.category || "");

      // Get random features for this category
      const features = getRandomFeatures(categoryType, 3);

      // Update the product
      await Product.findByIdAndUpdate(product._id, {
        $set: {
          "specifications.keyFeatures": features,
        },
      });

      console.log(`✅ Updated "${product.name}" (${categoryType})`);
      console.log(
        `   Added features: ${features.map((f) => f.key).join(", ")}`,
      );
      updatedCount++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   ✅ Updated: ${updatedCount} products`);
    console.log(
      `   ⏭️  Skipped: ${skippedCount} products (already had features)`,
    );
    console.log(`   📦 Total: ${products.length} products`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
}

// Run the migration
migrateProducts();
