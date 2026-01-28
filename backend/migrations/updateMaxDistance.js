import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliverySettings from '../models/DeliverySettings.js';

dotenv.config();

const updateMaxDistance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const result = await DeliverySettings.findOneAndUpdate(
      {},
      { 
        $set: { 
          maxDeliveryDistance: 7,
          distanceTiers: [
            { maxDistance: 5, charge: 30 },
            { maxDistance: 7, charge: 35 }
          ]
        } 
      },
      { new: true }
    );

    console.log('✅ Updated delivery settings:');
    console.log('   Max Distance:', result.maxDeliveryDistance, 'km');
    console.log('   Distance Tiers:', result.distanceTiers);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateMaxDistance();
