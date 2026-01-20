import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kuldeepprasadpantofficial:TK6o1oAh4TjIBRCb@cluster0.pe4muvt.mongodb.net/door2door?retryWrites=true&w=majority';

async function clearUserProfile() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const DeliveryRiderProfile = mongoose.connection.collection('deliveryriderprofiles');

    // Clear dateOfBirth and address for all profiles
    const result = await DeliveryRiderProfile.updateMany(
      {},
      { 
        $unset: { 
          dateOfBirth: "",
          address: ""
        } 
      }
    );

    console.log(`✅ Cleared DOB and address for ${result.modifiedCount} profiles`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

clearUserProfile();
