import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CustomerProfile from '../models/CustomerProfile.js';

dotenv.config();

const customerCoordinates = [
  {
    latitude: 31.280097905798122,
    longitude: 75.67660753832753
  },
  {
    latitude: 31.273845102436127,
    longitude: 75.68525163832726
  },
  {
    latitude: 31.316183348974846,
    longitude: 75.57815235050028
  }
];

const migrateCustomerAddresses = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/door2door');
    console.log('✅ Connected to MongoDB');

    // Get all customer profiles that have addresses
    const customers = await CustomerProfile.find({ 'addresses.0': { $exists: true } });
    console.log(`📦 Found ${customers.length} customers with addresses in database`);

    if (customers.length === 0) {
      console.log('⚠️  No customers with addresses found in database.');
      return;
    }

    let updatedCount = 0;
    let addressesUpdated = 0;

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      
      if (!customer.addresses || customer.addresses.length === 0) {
        continue;
      }

      // Update each address with new coordinates using direct update
      const updateOperations = {};
      
      for (let j = 0; j < customer.addresses.length; j++) {
        const coordIndex = (i * customer.addresses.length + j) % customerCoordinates.length;
        const newCoords = customerCoordinates[coordIndex];

        updateOperations[`addresses.${j}.latitude`] = newCoords.latitude;
        updateOperations[`addresses.${j}.longitude`] = newCoords.longitude;
        addressesUpdated++;
      }

      await CustomerProfile.updateOne(
        { _id: customer._id },
        { $set: updateOperations },
        { runValidators: false }
      );

      console.log(`✓ Updated ${customer.addresses.length} address(es) for customer: ${customer.userId}`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} customers with ${addressesUpdated} total addresses`);
    console.log(`📍 Coordinates used: ${customerCoordinates.length} unique LPU-area locations`);

  } catch (error) {
    console.error('❌ Error migrating customer addresses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the migration
migrateCustomerAddresses();
