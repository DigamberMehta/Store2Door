import mongoose from "mongoose";
import dotenv from "dotenv";
import DeliveryRiderProfile from "../models/DeliveryRiderProfile.js";

dotenv.config();

const migrateDocuments = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/store2door",
    );
    console.log("Connected to MongoDB");

    // Get all delivery rider profiles
    const profiles = await DeliveryRiderProfile.find({});
    console.log(`Found ${profiles.length} profiles to migrate`);

    let migratedCount = 0;

    for (const profile of profiles) {
      let needsUpdate = false;

      // Initialize documents object if it doesn't exist
      if (!profile.documents) {
        profile.documents = {};
        needsUpdate = true;
      }

      // List of all document types
      const documentTypes = [
        "profilePhoto",
        "vehiclePhoto",
        "idDocument",
        "workPermit",
        "driversLicence",
        "proofOfBankingDetails",
        "proofOfAddress",
        "vehicleLicense",
        "thirdPartyInsurance",
        "vehicleAssessment",
        "carrierAgreement",
      ];

      // Migrate each document type
      for (const docType of documentTypes) {
        if (profile.documents[docType]) {
          const doc = profile.documents[docType];

          // Add missing fields with defaults
          if (!doc.status) {
            // If imageUrl exists, set status to pending, otherwise not_uploaded
            doc.status = doc.imageUrl ? "pending" : "not_uploaded";
            needsUpdate = true;
          }

          if (doc.isVerified === undefined) {
            doc.isVerified = false;
            needsUpdate = true;
          }

          if (!doc.uploadedAt && doc.imageUrl) {
            doc.uploadedAt = profile.createdAt || new Date();
            needsUpdate = true;
          }

          if (!doc.rejectionReason) {
            doc.rejectionReason = null;
            needsUpdate = true;
          }
        } else {
          // Initialize document with default values
          profile.documents[docType] = {
            imageUrl: null,
            cloudinaryPublicId: null,
            isVerified: false,
            status: "not_uploaded",
            rejectionReason: null,
            uploadedAt: null,
          };
          needsUpdate = true;
        }
      }

      // Migrate legacy fields if they exist
      if (
        profile.documents.drivingLicense?.imageUrl &&
        !profile.documents.driversLicence?.imageUrl
      ) {
        profile.documents.driversLicence = {
          ...profile.documents.driversLicence,
          imageUrl: profile.documents.drivingLicense.imageUrl,
          number: profile.documents.drivingLicense.number,
          expiryDate: profile.documents.drivingLicense.expiryDate,
          isVerified: profile.documents.drivingLicense.isVerified || false,
          status: profile.documents.drivingLicense.isVerified
            ? "verified"
            : "pending",
          uploadedAt: profile.createdAt || new Date(),
        };
        needsUpdate = true;
      }

      if (
        profile.documents.nationalId?.imageUrl &&
        !profile.documents.idDocument?.imageUrl
      ) {
        profile.documents.idDocument = {
          ...profile.documents.idDocument,
          imageUrl: profile.documents.nationalId.imageUrl,
          number: profile.documents.nationalId.number,
          isVerified: profile.documents.nationalId.isVerified || false,
          status: profile.documents.nationalId.isVerified
            ? "verified"
            : "pending",
          uploadedAt: profile.createdAt || new Date(),
        };
        needsUpdate = true;
      }

      if (needsUpdate) {
        profile.markModified("documents");
        await profile.save();
        migratedCount++;
        console.log(
          `Migrated profile: ${profile.userId} (${migratedCount}/${profiles.length})`,
        );
      }
    }

    console.log(`\nMigration completed successfully!`);
    console.log(`Total profiles: ${profiles.length}`);
    console.log(`Migrated profiles: ${migratedCount}`);
    console.log(`Unchanged profiles: ${profiles.length - migratedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateDocuments();
