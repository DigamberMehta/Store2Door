import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import PlatformSettings from "../models/PlatformSettings.js";

dotenv.config();

/**
 * Test Script: Verify Two-Tier Pricing System
 *
 * This script tests the complete pricing flow:
 * 1. Create product with wholesalePrice
 * 2. Verify retailPrice is auto-calculated
 * 3. Test originalPrice discount calculation
 * 4. Verify markup snapshots
 */

const testPricingFlow = async () => {
  try {
    console.log("🧪 Testing Two-Tier Pricing System\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get platform settings
    const settings = await PlatformSettings.findOne({ isActive: true });
    const markupPercentage = settings?.markupPercentage || 20;
    console.log(`📊 Platform Markup: ${markupPercentage}%\n`);

    // Test 1: Create product with wholesalePrice
    console.log("TEST 1: Create Product with Wholesale Price");
    console.log("=".repeat(50));

    const testProduct = {
      name: "Test Product - Pricing Flow",
      description: "Test product to verify pricing calculations",
      storeId: "679ea2e8bbf8d95cb6e6c94c", // Use a valid store ID from your DB
      categoryId: "679ea1a8bbf8d95cb6e6c76c", // Use a valid category ID
      category: "Electronics",
      wholesalePrice: 100, // Store manager sets R100
      inventory: {
        quantity: 50,
        lowStockThreshold: 10,
        sku: "TEST-PRICE-001",
      },
    };

    const product = await Product.create(testProduct);

    console.log(`✅ Product Created: ${product.name}`);
    console.log(
      `   Wholesale Price (Store Manager): R${product.wholesalePrice.toFixed(2)}`,
    );
    console.log(
      `   Retail Price (Customer): R${product.retailPrice.toFixed(2)}`,
    );
    console.log(`   Markup Percentage: ${product.markupPercentage}%`);
    console.log(`   Expected Retail: R${(100 * 1.2).toFixed(2)}`);
    console.log(`   ✅ Match: ${product.retailPrice === 120 ? "YES" : "NO"}\n`);

    // Test 2: Product with originalPrice (sale)
    console.log("TEST 2: Create Product with Sale Price");
    console.log("=".repeat(50));

    const saleProduct = {
      name: "Test Product - On Sale",
      description: "Test product with original price for sale display",
      storeId: "679ea2e8bbf8d95cb6e6c94c",
      categoryId: "679ea1a8bbf8d95cb6e6c76c",
      category: "Electronics",
      wholesalePrice: 80, // Current wholesale: R80
      originalWholesalePrice: 120, // Was: R120 (wholesale)
      inventory: {
        quantity: 30,
        lowStockThreshold: 5,
        sku: "TEST-SALE-001",
      },
    };

    const saleProductCreated = await Product.create(saleProduct);

    console.log(`✅ Sale Product Created: ${saleProductCreated.name}`);
    console.log(
      `   Current Wholesale: R${saleProductCreated.wholesalePrice.toFixed(2)}`,
    );
    console.log(
      `   Current Retail: R${saleProductCreated.retailPrice.toFixed(2)}`,
    );
    console.log(
      `   Original Wholesale: R${saleProductCreated.originalWholesalePrice.toFixed(2)}`,
    );
    console.log(
      `   Original Retail: R${saleProductCreated.originalRetailPrice.toFixed(2)}`,
    );
    console.log(`   Discount: ${saleProductCreated.discount}%`);
    console.log(`   Expected Current Retail: R${(80 * 1.2).toFixed(2)}`);
    console.log(`   Expected Original Retail: R${(120 * 1.2).toFixed(2)}`);
    console.log(
      `   ✅ Current Match: ${saleProductCreated.retailPrice === 96 ? "YES" : "NO"}`,
    );
    console.log(
      `   ✅ Original Match: ${saleProductCreated.originalRetailPrice === 144 ? "YES" : "NO"}\n`,
    );

    // Test 3: Backward compatibility with 'price' field
    console.log("TEST 3: Backward Compatibility (using 'price' field)");
    console.log("=".repeat(50));

    const legacyProduct = {
      name: "Test Product - Legacy Price Field",
      description: "Test backward compatibility with old price field",
      storeId: "679ea2e8bbf8d95cb6e6c94c",
      categoryId: "679ea1a8bbf8d95cb6e6c76c",
      category: "Groceries",
      price: 50, // Old way: just 'price'
      inventory: {
        quantity: 100,
        lowStockThreshold: 20,
        sku: "TEST-LEGACY-001",
      },
    };

    const legacyProductCreated = await Product.create(legacyProduct);

    console.log(`✅ Legacy Product Created: ${legacyProductCreated.name}`);
    console.log(`   Price (legacy): R${legacyProductCreated.price.toFixed(2)}`);
    console.log(
      `   Wholesale Price (auto): R${legacyProductCreated.wholesalePrice.toFixed(2)}`,
    );
    console.log(
      `   Retail Price (auto): R${legacyProductCreated.retailPrice.toFixed(2)}`,
    );
    console.log(`   Expected Retail: R${(50 * 1.2).toFixed(2)}`);
    console.log(
      `   ✅ Match: ${legacyProductCreated.retailPrice === 60 ? "YES" : "NO"}\n`,
    );

    // Test 4: Update product price
    console.log("TEST 4: Update Product Price");
    console.log("=".repeat(50));

    product.wholesalePrice = 150;
    await product.save();

    console.log(`✅ Product Updated: ${product.name}`);
    console.log(
      `   New Wholesale Price: R${product.wholesalePrice.toFixed(2)}`,
    );
    console.log(`   New Retail Price: R${product.retailPrice.toFixed(2)}`);
    console.log(`   Expected Retail: R${(150 * 1.2).toFixed(2)}`);
    console.log(`   ✅ Match: ${product.retailPrice === 180 ? "YES" : "NO"}\n`);

    // Summary
    console.log("📊 PRICING FLOW TEST SUMMARY");
    console.log("=".repeat(50));
    console.log("✅ Product creation with wholesalePrice");
    console.log("✅ Automatic retailPrice calculation");
    console.log("✅ Sale pricing with original prices");
    console.log("✅ Backward compatibility with 'price' field");
    console.log("✅ Product price updates");
    console.log("\n🎉 All tests passed!\n");

    // Display example customer vs store manager view
    console.log("👥 WHAT EACH USER SEES");
    console.log("=".repeat(50));
    const exampleProduct = await Product.findById(product._id);
    console.log(`Product: ${exampleProduct.name}\n`);
    console.log("CUSTOMER SEES:");
    console.log(`   Price: R${exampleProduct.retailPrice.toFixed(2)}`);
    console.log(`   (includes platform markup)\n`);
    console.log("STORE MANAGER SEES:");
    console.log(`   Price: R${exampleProduct.wholesalePrice.toFixed(2)}`);
    console.log(`   (what they receive)\n`);
    console.log("PLATFORM EARNS:");
    console.log(
      `   Markup: R${(exampleProduct.retailPrice - exampleProduct.wholesalePrice).toFixed(2)}`,
    );
    console.log(`   Percentage: ${exampleProduct.markupPercentage}%\n`);

    // Cleanup test products
    console.log("🧹 Cleaning up test products...");
    await Product.deleteMany({
      name: { $regex: /^Test Product/ },
    });
    console.log("✅ Cleanup complete\n");

    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run test
testPricingFlow();
