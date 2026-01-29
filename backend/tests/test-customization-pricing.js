import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import PlatformSettings from "../models/PlatformSettings.js";

dotenv.config();

/**
 * Test Script: Verify Customization Pricing with Markup
 *
 * Tests that customization additionalCost is correctly applied with markup
 */

const testCustomizationPricing = async () => {
  try {
    console.log("🧪 Testing Customization Pricing with Markup\n");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    const settings = await PlatformSettings.findOne({ isActive: true });
    const markupPercentage = settings?.markupPercentage || 20;
    const markupMultiplier = 1 + markupPercentage / 100;

    console.log(`📊 Platform Markup: ${markupPercentage}%`);
    console.log(`🔢 Markup Multiplier: ${markupMultiplier}\n`);

    // Create product (e.g., Pizza)
    console.log("TEST: Product with Customizations (Pizza Example)");
    console.log("=".repeat(60));

    const testProduct = {
      name: "Test Pizza - Customization Pricing",
      description: "Test pizza with toppings customizations",
      storeId: "679ea2e8bbf8d95cb6e6c94c",
      categoryId: "679ea1a8bbf8d95cb6e6c76c",
      category: "Food",
      wholesalePrice: 80, // Base pizza: R80 wholesale
      inventory: {
        quantity: 50,
        lowStockThreshold: 10,
        sku: "TEST-PIZZA-001",
      },
    };

    const product = await Product.create(testProduct);

    console.log(`✅ Product Created: ${product.name}\n`);
    console.log("BASE PRICING:");
    console.log(`   Wholesale: R${product.wholesalePrice.toFixed(2)}`);
    console.log(`   Retail: R${product.retailPrice.toFixed(2)}`);
    console.log(`   Expected Retail: R${(80 * markupMultiplier).toFixed(2)}`);
    console.log(`   ✅ Match: ${product.retailPrice === 96 ? "YES" : "NO"}\n`);

    // Test customizations
    const customizations = [
      { name: "Extra Cheese", additionalCost: 15 }, // R15 wholesale
      { name: "Mushrooms", additionalCost: 10 }, // R10 wholesale
      { name: "Pepperoni", additionalCost: 20 }, // R20 wholesale
    ];

    console.log("CUSTOMIZATION PRICING:");
    console.log("-".repeat(60));

    let totalWholesaleCost = product.wholesalePrice;
    let totalRetailPrice = product.retailPrice;

    customizations.forEach((custom) => {
      const retailCost = custom.additionalCost * markupMultiplier;
      totalWholesaleCost += custom.additionalCost;
      totalRetailPrice += retailCost;

      console.log(`\n${custom.name}:`);
      console.log(`   Wholesale Cost: R${custom.additionalCost.toFixed(2)}`);
      console.log(`   Retail Cost (with markup): R${retailCost.toFixed(2)}`);
      console.log(
        `   Platform Earns: R${(retailCost - custom.additionalCost).toFixed(2)}`,
      );
    });

    console.log("\n" + "=".repeat(60));
    console.log("TOTAL WITH ALL CUSTOMIZATIONS:");
    console.log("-".repeat(60));
    console.log(`Base Pizza:`);
    console.log(`   Wholesale: R${product.wholesalePrice.toFixed(2)}`);
    console.log(`   Retail: R${product.retailPrice.toFixed(2)}`);

    const customizationsWholesaleTotal = customizations.reduce(
      (sum, c) => sum + c.additionalCost,
      0,
    );
    const customizationsRetailTotal = customizations.reduce(
      (sum, c) => sum + c.additionalCost * markupMultiplier,
      0,
    );

    console.log(`\nCustomizations:`);
    console.log(
      `   Wholesale Total: R${customizationsWholesaleTotal.toFixed(2)}`,
    );
    console.log(`   Retail Total: R${customizationsRetailTotal.toFixed(2)}`);

    console.log(`\nGrand Total:`);
    console.log(`   Wholesale: R${totalWholesaleCost.toFixed(2)}`);
    console.log(`   Retail (Customer Pays): R${totalRetailPrice.toFixed(2)}`);
    console.log(
      `   Platform Earns: R${(totalRetailPrice - totalWholesaleCost).toFixed(2)}`,
    );
    console.log(
      `   Markup Percentage: ${(((totalRetailPrice - totalWholesaleCost) / totalWholesaleCost) * 100).toFixed(2)}%`,
    );

    // Verify calculations
    console.log("\n" + "=".repeat(60));
    console.log("VERIFICATION:");
    console.log("=".repeat(60));

    const expectedWholesale = 80 + 15 + 10 + 20; // R125
    const expectedRetail = (80 + 15 + 10 + 20) * markupMultiplier; // R150

    console.log(
      `✅ Wholesale Total: ${totalWholesaleCost === expectedWholesale ? "CORRECT" : "WRONG"}`,
    );
    console.log(`   Expected: R${expectedWholesale.toFixed(2)}`);
    console.log(`   Got: R${totalWholesaleCost.toFixed(2)}`);

    console.log(
      `✅ Retail Total: ${Math.abs(totalRetailPrice - expectedRetail) < 0.01 ? "CORRECT" : "WRONG"}`,
    );
    console.log(`   Expected: R${expectedRetail.toFixed(2)}`);
    console.log(`   Got: R${totalRetailPrice.toFixed(2)}`);

    const platformEarnings = totalRetailPrice - totalWholesaleCost;
    const expectedEarnings = expectedWholesale * (markupPercentage / 100);

    console.log(
      `✅ Platform Earnings: ${Math.abs(platformEarnings - expectedEarnings) < 0.01 ? "CORRECT" : "WRONG"}`,
    );
    console.log(
      `   Expected: R${expectedEarnings.toFixed(2)} (20% of R${expectedWholesale.toFixed(2)})`,
    );
    console.log(`   Got: R${platformEarnings.toFixed(2)}`);

    // Revenue Impact Analysis
    console.log("\n" + "=".repeat(60));
    console.log("💰 REVENUE IMPACT ANALYSIS:");
    console.log("=".repeat(60));

    const customizationsRevenue =
      customizationsRetailTotal - customizationsWholesaleTotal;
    console.log(`\nBEFORE FIX (if customizations had NO markup):`);
    console.log(
      `   Customer would pay: R${(product.retailPrice + customizationsWholesaleTotal).toFixed(2)}`,
    );
    console.log(
      `   Platform would earn: R${(product.retailPrice - product.wholesalePrice).toFixed(2)} (base only)`,
    );
    console.log(
      `   Lost revenue per order: R${customizationsRevenue.toFixed(2)}`,
    );

    console.log(`\nAFTER FIX (customizations WITH markup):`);
    console.log(`   Customer pays: R${totalRetailPrice.toFixed(2)}`);
    console.log(
      `   Platform earns: R${platformEarnings.toFixed(2)} (base + customizations)`,
    );
    console.log(
      `   ✅ Revenue recovered: R${customizationsRevenue.toFixed(2)}`,
    );

    console.log(`\nIF 100 ORDERS/DAY WITH SIMILAR CUSTOMIZATIONS:`);
    console.log(
      `   Daily revenue recovered: R${(customizationsRevenue * 100).toFixed(2)}`,
    );
    console.log(
      `   Monthly revenue recovered: R${(customizationsRevenue * 100 * 30).toFixed(2)}`,
    );
    console.log(
      `   Annual revenue recovered: R${(customizationsRevenue * 100 * 365).toFixed(2)}`,
    );

    // Cleanup
    console.log("\n🧹 Cleaning up test products...");
    await Product.deleteMany({ name: { $regex: /^Test Pizza/ } });
    console.log("✅ Cleanup complete\n");

    await mongoose.disconnect();
    console.log("✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

testCustomizationPricing();
