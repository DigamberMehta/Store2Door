import mongoose from "mongoose";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Migration to update bank account fields for South African banking system:
 * 1. Remove routingNumber field (not used in South Africa)
 * 2. Update accountType from US types (checking/savings) to SA types (cheque/savings/transmission)
 */
const updateBankAccountFields = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    console.log("Starting bank account fields migration...");

    // Find all profiles with bank details
    const profiles = await DeliveryRiderProfile.find({
      bankDetails: { $exists: true },
    });

    console.log(`Found ${profiles.length} profiles to check`);

    let updatedCount = 0;

    for (const profile of profiles) {
      let needsUpdate = false;

      // Remove routingNumber if it exists
      if (profile.bankDetails.routingNumber !== undefined) {
        profile.bankDetails.routingNumber = undefined;
        needsUpdate = true;
      }

      // Convert US account types to South African types
      if (profile.bankDetails.accountType) {
        const currentType = profile.bankDetails.accountType;

        // Map US types to SA types
        if (currentType === "checking") {
          profile.bankDetails.accountType = "cheque";
          needsUpdate = true;
        }
        // "savings" remains "savings" in both systems

        console.log(
          `Profile ${profile._id}: Account type: ${currentType} -> ${profile.bankDetails.accountType}`,
        );
      } else if (
        profile.bankDetails.accountHolderName ||
        profile.bankDetails.accountNumber
      ) {
        // If bank details exist but no type, set default
        profile.bankDetails.accountType = "cheque";
        needsUpdate = true;
      }

      if (needsUpdate) {
        profile.markModified("bankDetails");
        await profile.save({ validateBeforeSave: false });
        updatedCount++;
        console.log(`Updated profile ${profile._id}`);
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`Total profiles checked: ${profiles.length}`);
    console.log(`Profiles updated: ${updatedCount}`);
    console.log(`Profiles unchanged: ${profiles.length - updatedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

// Run migration
updateBankAccountFields();
