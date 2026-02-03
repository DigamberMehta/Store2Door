import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables");
  process.exit(1);
}

async function removeWorkScheduleAndServiceAreas() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    const db = mongoose.connection.db;
    const collection = db.collection("deliveryriderprofiles");

    // Count documents before migration
    const totalDocs = await collection.countDocuments();
    console.log(`\nTotal delivery rider profiles found: ${totalDocs}`);

    // Count documents with workSchedule or serviceAreas
    const docsWithWorkSchedule = await collection.countDocuments({
      workSchedule: { $exists: true },
    });
    const docsWithServiceAreas = await collection.countDocuments({
      serviceAreas: { $exists: true },
    });

    console.log(`Documents with workSchedule: ${docsWithWorkSchedule}`);
    console.log(`Documents with serviceAreas: ${docsWithServiceAreas}`);

    if (docsWithWorkSchedule === 0 && docsWithServiceAreas === 0) {
      console.log("\nNo documents to migrate. All clean!");
      await mongoose.connection.close();
      return;
    }

    console.log("\n--- Starting Migration ---");

    // Remove workSchedule and serviceAreas fields
    const result = await collection.updateMany(
      {},
      {
        $unset: {
          workSchedule: "",
          serviceAreas: "",
        },
      },
    );

    console.log(`\nMigration Results:`);
    console.log(`- Documents matched: ${result.matchedCount}`);
    console.log(`- Documents modified: ${result.modifiedCount}`);

    // Verify the migration
    const remainingWorkSchedule = await collection.countDocuments({
      workSchedule: { $exists: true },
    });
    const remainingServiceAreas = await collection.countDocuments({
      serviceAreas: { $exists: true },
    });

    console.log(`\nVerification:`);
    console.log(
      `- Documents still with workSchedule: ${remainingWorkSchedule}`,
    );
    console.log(
      `- Documents still with serviceAreas: ${remainingServiceAreas}`,
    );

    if (remainingWorkSchedule === 0 && remainingServiceAreas === 0) {
      console.log("\n✅ Migration completed successfully!");
    } else {
      console.log(
        "\n⚠️ Migration completed but some documents still have the fields.",
      );
    }

    console.log("\nClosing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("\n❌ Error during migration:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the migration
console.log("=== Remove workSchedule and serviceAreas Migration ===");
console.log("This script will remove workSchedule and serviceAreas fields");
console.log("from all delivery rider profiles in the database.");
console.log("====================================================\n");

removeWorkScheduleAndServiceAreas();
