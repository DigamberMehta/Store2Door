import mongoose from "mongoose";
import Category from "../models/Category.js";

const addMissingSlugs = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/door2door");
    console.log("Connected to MongoDB");

    // Update categories without slugs
    const updates = [
      { name: "Electronics", slug: "electronics" },
      { name: "Sports & Fitness", slug: "sports-fitness" },
      { name: "Books & Media", slug: "books-media" },
      { name: "Pet Supplies", slug: "pet-supplies" },
    ];

    for (const update of updates) {
      const result = await Category.updateOne(
        { name: update.name, level: 1 },
        { $set: { slug: update.slug, path: update.slug } },
      );
      console.log(
        `Added slug "${update.slug}" to "${update.name}": ${result.modifiedCount} document(s)`,
      );
    }

    console.log("\n✅ Slugs added successfully!");

    // Verify the changes
    const categories = await Category.find({ level: 1, isActive: true })
      .select("name slug")
      .sort({ displayOrder: 1 });

    console.log("\nAll categories:");
    categories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Error adding slugs:", error);
    process.exit(1);
  }
};

addMissingSlugs();
