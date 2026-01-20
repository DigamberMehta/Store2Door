// Migration script to clean up documents with empty objects
// Run this once to fix existing profiles

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kuldeepprasadpantofficial:TK6o1oAh4TjIBRCb@cluster0.pe4muvt.mongodb.net/door2door?retryWrites=true&w=majority';

async function cleanupDocuments() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const DeliveryRiderProfile = mongoose.connection.collection('deliveryriderprofiles');

    // Find all profiles with documents
    const profiles = await DeliveryRiderProfile.find({ documents: { $exists: true } }).toArray();
    
    console.log(`Found ${profiles.length} profiles with documents field`);

    for (const profile of profiles) {
      const documentTypes = [
        'profilePhoto',
        'vehiclePhoto',
        'idDocument',
        'workPermit',
        'driversLicence',
        'proofOfBankingDetails',
        'proofOfAddress',
        'vehicleLicense',
        'thirdPartyInsurance',
        'vehicleAssessment',
        'carrierAgreement',
      ];

      let needsUpdate = false;
      const cleanedDocuments = { ...profile.documents };

      // Remove empty document objects (those without imageUrl)
      for (const docType of documentTypes) {
        if (cleanedDocuments[docType] && !cleanedDocuments[docType].imageUrl) {
          delete cleanedDocuments[docType];
          needsUpdate = true;
          console.log(`  Removing empty ${docType} from profile ${profile._id}`);
        }
      }

      if (needsUpdate) {
        await DeliveryRiderProfile.updateOne(
          { _id: profile._id },
          { $set: { documents: cleanedDocuments } }
        );
        console.log(`✓ Cleaned profile ${profile._id}`);
      }
    }

    console.log('\n✅ Migration completed successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

cleanupDocuments();
