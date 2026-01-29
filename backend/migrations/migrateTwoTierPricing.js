import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import PlatformSettings from "../models/PlatformSettings.js";

dotenv.config();

/**
 * Migration Script: Convert existing products to two-tier pricing
 *
 * This script:
 * 1. Fetches the current platform markup percentage
 * 2. Updates all existing products that don't have wholesalePrice/retailPrice
 * 3. Sets wholesalePrice = current price (what store manager set)
 * 4. Calculates retailPrice = wholesalePrice × (1 + markup%)
 * 5. Stores the markup percentage snapshot for audit trail
 *
 * Run with: node migrations/migrateTwoTierPricing.js
 */

const migrateTwoTierPricing = async () => {
  try {
    console.log("🚀 Starting two-tier pricing migration...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get platform settings for markup percentage
    const settings = await PlatformSettings.findOne({ isActive: true });
    const markupPercentage = settings?.markupPercentage || 20;
    const markupMultiplier = 1 + markupPercentage / 100;

    console.log(`📊 Platform markup: ${markupPercentage}%`);
    console.log(`🔢 Markup multiplier: ${markupMultiplier}\n`);

    // Find all products that need migration (no wholesalePrice or no retailPrice)
    const productsToMigrate = await Product.find({
      $or: [
        { wholesalePrice: { $exists: false } },
        { retailPrice: { $exists: false } },
        { wholesalePrice: null },
        { retailPrice: null },
      ],
    });

    console.log(`📦 Found ${productsToMigrate.length} products to migrate\n`);

    if (productsToMigrate.length === 0) {
      console.log(
        "✅ No products to migrate. All products already have two-tier pricing.\n",
      );
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Migrate each product
    for (const product of productsToMigrate) {
      try {
        // Current price becomes wholesalePrice (what store manager originally set)
        const wholesalePrice = product.price;

        // Calculate retailPrice (what customers see)
        const retailPrice =
          Math.round(wholesalePrice * markupMultiplier * 100) / 100;

        // Update product with new pricing structure
        await Product.findByIdAndUpdate(
          product._id,
          {
            $set: {
              wholesalePrice: wholesalePrice,
              retailPrice: retailPrice,
              markupPercentage: markupPercentage,
            },
          },
          { runValidators: true },
        );

        successCount++;

        if (successCount % 100 === 0) {
          console.log(`   Migrated ${successCount} products...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          productId: product._id,
          productName: product.name,
          error: error.message,
        });
      }
    }

    console.log("\n📊 Migration Summary:");
    console.log(`   ✅ Successfully migrated: ${successCount} products`);
    console.log(`   ❌ Errors: ${errorCount} products`);

    if (errors.length > 0) {
      console.log("\n❌ Products with errors:");
      errors.forEach((err) => {
        console.log(`   - ${err.productName} (${err.productId}): ${err.error}`);
      });
    }

    // Verify migration
    console.log("\n🔍 Verifying migration...");
    const remainingProducts = await Product.countDocuments({
      $or: [
        { wholesalePrice: { $exists: false } },
        { retailPrice: { $exists: false } },
        { wholesalePrice: null },
        { retailPrice: null },
      ],
    });

    if (remainingProducts === 0) {
      console.log("✅ All products successfully migrated!\n");
    } else {
      console.log(
        `⚠️  Warning: ${remainingProducts} products still need migration\n`,
      );
    }

    // Sample verification - show 3 migrated products
    console.log("📝 Sample migrated products:");
    const sampleProducts = await Product.find({
      wholesalePrice: { $exists: true },
      retailPrice: { $exists: true },
    })
      .limit(3)
      .select("name wholesalePrice retailPrice markupPercentage");

    sampleProducts.forEach((p) => {
      console.log(`   ${p.name}:`);
      console.log(`      Wholesale: R${p.wholesalePrice.toFixed(2)}`);
      console.log(`      Retail: R${p.retailPrice.toFixed(2)}`);
      console.log(`      Markup: ${p.markupPercentage}%\n`);
    });

    await mongoose.disconnect();
    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run migration
migrateTwoTierPricing();
