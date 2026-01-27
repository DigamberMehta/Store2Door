import mongoose from "mongoose";
import Category from "../models/Category.js";

const updateCategoryNames = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/door2door");
    console.log("Connected to MongoDB");

    // Update category names to match frontend
    const updates = [
      { old: "Groceries", new: "Grocery", slug: "grocery" },
      { old: "Personal Care", new: "Beauty", slug: "beauty" },
      { old: "Health & Pharmacy", new: "Pharmacy", slug: "pharmacy" },
      { old: "Fashion & Clothing", new: "Fashion", slug: "fashion" },
      { old: "Home & Garden", new: "Home", slug: "home" },
    ];

    for (const update of updates) {
      const result = await Category.updateOne(
        { name: update.old, level: 1 },
        { $set: { name: update.new, slug: update.slug, path: update.slug } },
      );
      console.log(
        `Updated "${update.old}" to "${update.new}": ${result.modifiedCount} document(s)`,
      );
    }

    console.log("\n✅ Category names updated successfully!");

    // Verify the changes
    const categories = await Category.find({ level: 1, isActive: true })
      .select("name slug")
      .sort({ displayOrder: 1 });

    console.log("\nUpdated categories:");
    categories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error updating categories:", error);
    process.exit(1);
  }
};

updateCategoryNames();
