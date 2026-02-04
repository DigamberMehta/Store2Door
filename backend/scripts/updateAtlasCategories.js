import mongoose from "mongoose";
import Category from "../models/Category.js";
import dotenv from "dotenv";

dotenv.config();

const updateAtlasCategories = async () => {
  try {
    // Connect to MongoDB Atlas
    const mongoUri =
      process.env.MONGODB_URI ||
      "mongodb+srv://digambermehta2603_db_user:3QWGrKyCGOpImdgX@cluster0.pe4muvt.mongodb.net/door2door?retryWrites=true&w=majority";
    await mongoose.connect(mongoUri);
    console.log(" Connected to MongoDB Atlas\n");

    // Update category names to match frontend
    const updates = [
      { old: "Grocery & Kitchen", new: "Grocery", slug: "grocery" },
      { old: "Groceries", new: "Grocery", slug: "grocery" },
      { old: "Snacks & Drinks", new: "Snacks", slug: "snacks" },
      { old: "Electronics & Gadgets", new: "Electronics", slug: "electronics" },
      { old: "Fashion & Apparel", new: "Fashion", slug: "fashion" },
      { old: "Fashion & Clothing", new: "Fashion", slug: "fashion" },
      { old: "Beauty & Personal Care", new: "Beauty", slug: "beauty" },
      { old: "Personal Care", new: "Beauty", slug: "beauty" },
      { old: "Home & Furniture", new: "Home", slug: "home" },
      { old: "Home & Garden", new: "Home", slug: "home" },
      { old: "Health & Pharmacy", new: "Pharmacy", slug: "pharmacy" },
    ];

    console.log("Updating categories...\n");
    let totalUpdated = 0;

    for (const update of updates) {
      const result = await Category.updateMany(
        { name: update.old, level: 1 },
        { $set: { name: update.new, slug: update.slug, path: update.slug } },
      );
      if (result.modifiedCount > 0) {
        console.log(
          `✓ Updated "${update.old}" → "${update.new}" (${result.modifiedCount} document(s))`,
        );
        totalUpdated += result.modifiedCount;
      }
    }

    console.log(`\n✅ Total updated: ${totalUpdated} categories\n`);

    // Verify the changes
    const categories = await Category.find({ level: 1, isActive: true })
      .select("name slug")
      .sort({ displayOrder: 1 });

    console.log("Current categories in Atlas:");
    categories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB Atlas");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating categories:", error);
    process.exit(1);
  }
};

updateAtlasCategories();
