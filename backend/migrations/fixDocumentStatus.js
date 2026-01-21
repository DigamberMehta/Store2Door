import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkAndMigrate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/door2door');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Check delivery rider profiles
    const deliveryRiderProfiles = db.collection('deliveryriderprofiles');
    const count = await deliveryRiderProfiles.countDocuments();
    console.log(`\nFound ${count} delivery rider profiles`);

    if (count > 0) {
      // Update all profiles with new document structure
      const result = await deliveryRiderProfiles.updateMany(
        {},
        {
          $set: {
            'documents.profilePhoto.status': 'not_uploaded',
            'documents.profilePhoto.isVerified': false,
            'documents.vehiclePhoto.status': 'not_uploaded',
            'documents.vehiclePhoto.isVerified': false,
            'documents.idDocument.status': 'not_uploaded',
            'documents.idDocument.isVerified': false,
            'documents.workPermit.status': 'not_uploaded',
            'documents.workPermit.isVerified': false,
            'documents.driversLicence.status': 'not_uploaded',
            'documents.driversLicence.isVerified': false,
            'documents.proofOfBankingDetails.status': 'not_uploaded',
            'documents.proofOfBankingDetails.isVerified': false,
            'documents.proofOfAddress.status': 'not_uploaded',
            'documents.proofOfAddress.isVerified': false,
            'documents.vehicleLicense.status': 'not_uploaded',
            'documents.vehicleLicense.isVerified': false,
            'documents.thirdPartyInsurance.status': 'not_uploaded',
            'documents.thirdPartyInsurance.isVerified': false,
            'documents.vehicleAssessment.status': 'not_uploaded',
            'documents.vehicleAssessment.isVerified': false,
            'documents.carrierAgreement.status': 'not_uploaded',
            'documents.carrierAgreement.isVerified': false,
          }
        }
      );

      console.log(`\nUpdated ${result.modifiedCount} profiles with default document structure`);

      // Now update profiles that have uploaded documents
      const profilesWithDocs = await deliveryRiderProfiles.find({
        $or: [
          { 'documents.profilePhoto.imageUrl': { $exists: true, $ne: null } },
          { 'documents.vehiclePhoto.imageUrl': { $exists: true, $ne: null } },
          { 'documents.idDocument.imageUrl': { $exists: true, $ne: null } },
          { 'documents.driversLicence.imageUrl': { $exists: true, $ne: null } },
          { 'documents.proofOfBankingDetails.imageUrl': { $exists: true, $ne: null } },
          { 'documents.proofOfAddress.imageUrl': { $exists: true, $ne: null } },
          { 'documents.vehicleLicense.imageUrl': { $exists: true, $ne: null } },
          { 'documents.thirdPartyInsurance.imageUrl': { $exists: true, $ne: null } },
          { 'documents.vehicleAssessment.imageUrl': { $exists: true, $ne: null } },
          { 'documents.carrierAgreement.imageUrl': { $exists: true, $ne: null } },
        ]
      }).toArray();

      console.log(`Found ${profilesWithDocs.length} profiles with uploaded documents`);

      for (const profile of profilesWithDocs) {
        const updates = {};
        
        const docTypes = [
          'profilePhoto', 'vehiclePhoto', 'idDocument', 'workPermit', 'driversLicence',
          'proofOfBankingDetails', 'proofOfAddress', 'vehicleLicense', 
          'thirdPartyInsurance', 'vehicleAssessment', 'carrierAgreement'
        ];

        for (const docType of docTypes) {
          if (profile.documents?.[docType]?.imageUrl) {
            updates[`documents.${docType}.status`] = 'pending';
            updates[`documents.${docType}.uploadedAt`] = profile.createdAt || new Date();
          }
        }

        if (Object.keys(updates).length > 0) {
          await deliveryRiderProfiles.updateOne(
            { _id: profile._id },
            { $set: updates }
          );
          console.log(`Updated profile ${profile._id} with pending status for uploaded documents`);
        }
      }

      console.log('\nMigration completed successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

checkAndMigrate();
