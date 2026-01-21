import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryRiderProfile from '../models/DeliveryRiderProfile.js';

dotenv.config();

const clearWorkSchedule = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear workSchedule for all driver profiles
    const result = await DeliveryRiderProfile.updateMany(
      {},
      { 
        $set: { workSchedule: [] }
      }
    );

    console.log(`✅ Work schedule cleared successfully!`);
    console.log(`   Modified ${result.modifiedCount} documents`);
    console.log(`   Matched ${result.matchedCount} documents`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing work schedule:', error);
    process.exit(1);
  }
};

clearWorkSchedule();
