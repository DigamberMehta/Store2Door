import mongoose from "mongoose";
import dotenv from "dotenv";
import Store from "../models/Store.js";

dotenv.config();

const lpuAddresses = [
  {
    street: "Adarsh Nagar, Phagwara Sharki, Law Gate Road, Near LPU",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.2587571435273,
    longitude: 75.69652739254981,
  },
  {
    street:
      "Law Gate Road, Guru Hargobind Nagar, Near Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.255457878363444,
    longitude: 75.69480113494721,
  },
  {
    street:
      "GT Road, Phagwara Sharki, Near Law Gate, Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.254320172708592,
    longitude: 75.69911412522612,
  },
  {
    street: "Law Gate Road, Guru Hargobind Nagar, Near LPU",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.255457878363444,
    longitude: 75.69480113494721,
  },
  {
    street:
      "Highway Plaza Market, Law Gate Road, Near Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.262847599999986,
    longitude: 75.70308284213986,
  },
  {
    street:
      "Beside Balaji Store, Law Gate, Near Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144411",
    country: "India",
    latitude: 31.25668276757237,
    longitude: 75.69151691895972,
  },
  {
    street:
      "Shop No. 505, Level 5, Block 15-A, Lovely Professional University Campus",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144411",
    country: "India",
    latitude: 31.26428672490753,
    longitude: 75.69526970367917,
  },
  {
    street: "Guru Harkrishan Nagar, Law Gate Back Side Road, Near LPU Hostels",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.247977850456564,
    longitude: 75.71059024324458,
  },
  {
    street:
      "Lovely View Estate, Law Gate Area, Jalandhar Cantt / Phagwara Border",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.273768094737175,
    longitude: 75.68460756716308,
  },
  {
    street: "Near P.G. Niwas, Law Gate Back Road, Phagwara Sharki, Near LPU",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.26815428048833,
    longitude: 75.7039299511004,
  },
  {
    street:
      "Law Gate Road, Meheru Village, Near Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144411",
    country: "India",
    latitude: 31.246194033727498,
    longitude: 75.71328800849456,
  },
  {
    street:
      "Highway Plaza Mall, Law Gate Road, Near Lovely Professional University",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144411",
    country: "India",
    latitude: 31.265050972785225,
    longitude: 75.69942119897281,
  },
  {
    street: "Highway Plaza Market, Law Gate Road, Near LPU Main Gate",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144411",
    country: "India",
    latitude: 31.265050972785225,
    longitude: 75.69942119897281,
  },
  {
    street: "Law Gate Market, Near LPU Girls Hostel Area",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.26923253538051,
    longitude: 75.70126655791955,
  },
  {
    street: "Law Gate Back Side Road, Near LPU Hostels",
    city: "Phagwara",
    province: "Punjab",
    postalCode: "144401",
    country: "India",
    latitude: 31.26923253538051,
    longitude: 75.70126655791955,
  },
];

const migrateStoreAddresses = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI ||
        process.env.MONGODB_URI ||
        "mongodb://localhost:27017/store2door",
    );
    console.log("✅ Connected to MongoDB");

    // Get all stores
    const stores = await Store.find({});
    console.log(`📦 Found ${stores.length} stores in database`);

    if (stores.length === 0) {
      console.log(
        "⚠️  No stores found in database. Please create stores first.",
      );
      return;
    }

    // Update each store with a new address from the LPU area
    let updatedCount = 0;
    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      const addressIndex = i % lpuAddresses.length; // Cycle through addresses if more stores than addresses
      const newAddress = lpuAddresses[addressIndex];

      await Store.findByIdAndUpdate(store._id, {
        address: newAddress,
      });

      console.log(`✓ Updated ${store.name} with address: ${newAddress.street}`);
      updatedCount++;
    }

    console.log(
      `\n🎉 Successfully updated ${updatedCount} stores with LPU-area addresses`,
    );
  } catch (error) {
    console.error("❌ Error migrating addresses:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

// Run the migration
migrateStoreAddresses();
