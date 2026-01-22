import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    const DeliveryRiderProfile = mongoose.connection.collection(
      "deliveryriderprofiles",
    );

    console.log("\n=== Starting Migration ===");
    console.log(
      "Removing: registrationNumber, insuranceNumber, insuranceExpiry, registrationExpiry from vehicle",
    );
    console.log("Removing: thirdPartyInsurance document\n");

    // Count profiles before migration
    const totalProfiles = await DeliveryRiderProfile.countDocuments({});
    console.log(`Total profiles in database: ${totalProfiles}`);

    // Remove vehicle fields: registrationNumber, insuranceNumber, insuranceExpiry, registrationExpiry
    const vehicleFieldsResult = await DeliveryRiderProfile.updateMany(
      {},
      {
        $unset: {
          "vehicle.registrationNumber": "",
          "vehicle.insuranceNumber": "",
          "vehicle.insuranceExpiry": "",
          "vehicle.registrationExpiry": "",
        },
      },
    );

    console.log(
      `\nRemoved vehicle fields from ${vehicleFieldsResult.modifiedCount} profiles`,
    );

    // Remove thirdPartyInsurance document
    const insuranceDocResult = await DeliveryRiderProfile.updateMany(
      {},
      {
        $unset: {
          "documents.thirdPartyInsurance": "",
        },
      },
    );

    console.log(
      `Removed thirdPartyInsurance document from ${insuranceDocResult.modifiedCount} profiles`,
    );

    // Verify changes
    console.log("\n=== Verification ===");

    const profilesWithRemovedFields = await DeliveryRiderProfile.find({
      $or: [
        { "vehicle.registrationNumber": { $exists: true } },
        { "vehicle.insuranceNumber": { $exists: true } },
        { "vehicle.insuranceExpiry": { $exists: true } },
        { "vehicle.registrationExpiry": { $exists: true } },
        { "documents.thirdPartyInsurance": { $exists: true } },
      ],
    }).toArray();

    if (profilesWithRemovedFields.length === 0) {
      console.log("✅ All fields successfully removed!");
    } else {
      console.log(
        `⚠️ Warning: ${profilesWithRemovedFields.length} profiles still have the old fields`,
      );
      console.log(
        "Profile IDs:",
        profilesWithRemovedFields.map((p) => p._id),
      );
    }

    console.log("\n=== Migration Complete ===");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
    process.exit(0);
  }
}

migrate();
