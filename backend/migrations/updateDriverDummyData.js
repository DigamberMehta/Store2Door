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

async function updateDriverWithDummyData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully\n");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");
    const profilesCollection = db.collection("deliveryriderprofiles");

    // Find user by email
    const user = await usersCollection.findOne({ email: "driver@gmail.com" });

    if (!user) {
      console.error("❌ User with email 'driver@gmail.com' not found!");
      await mongoose.connection.close();
      return;
    }

    console.log(`✓ Found user: ${user.name} (${user.email})`);
    console.log(`  User ID: ${user._id}\n`);

    // Find or create rider profile
    let profile = await profilesCollection.findOne({ userId: user._id });

    if (!profile) {
      console.log("No profile found. Creating new profile...");
      await profilesCollection.insertOne({
        userId: user._id,
        vehicle: {},
        bankDetails: {},
        documents: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      profile = await profilesCollection.findOne({ userId: user._id });
    }

    console.log("Updating profile with dummy data...\n");

    // Update with dummy data
    const updateResult = await profilesCollection.updateOne(
      { userId: user._id },
      {
        $set: {
          // Vehicle Information
          vehicle: {
            type: "motorcycle",
            make: "Honda",
            model: "CB Shine",
            year: 2022,
            color: "black",
            licensePlate: "DL-08-AB-1234",
          },

          // Bank Details
          bankDetails: {
            accountHolderName: "Driver Name",
            accountNumber: "1234567890123456", // Will be hidden by default due to select: false
            routingNumber: "HDFC0001234",
            branchCode: "HDFC0001234",
            bankName: "HDFC Bank",
            accountType: "savings",
            isVerified: false,
          },

          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount > 0) {
      console.log("✅ Successfully updated profile with dummy data!");
      console.log("\nVehicle Details:");
      console.log("  Type: motorcycle");
      console.log("  Make: Honda");
      console.log("  Model: CB Shine");
      console.log("  Year: 2022");
      console.log("  Color: black");
      console.log("  License Plate: DL-08-AB-1234");

      console.log("\nBank Details:");
      console.log("  Account Holder: Driver Name");
      console.log("  Account Number: ************3456 (masked)");
      console.log("  Routing Number: HDFC0001234");
      console.log("  Branch Code: HDFC0001234");
      console.log("  Bank Name: HDFC Bank");
      console.log("  Account Type: savings");
      console.log("  Verified: false");
    } else {
      console.log("⚠️ No changes made (data might already exist)");
    }

    console.log("\nClosing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("\n❌ Error during update:", error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the update
console.log("=== Update Driver Dummy Data ===");
console.log("Adding vehicle and bank details for driver@gmail.com");
console.log("================================\n");

updateDriverWithDummyData();
