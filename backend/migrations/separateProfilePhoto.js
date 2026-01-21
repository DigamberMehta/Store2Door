import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import DeliveryRiderProfile from '../models/DeliveryRiderProfile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Migration: Separate profile photo from document verification
 * - Profile photo is now uploaded separately via profile page
 * - No longer part of required documents verification
 * - This migration marks any existing profilePhoto as optional
 */
const separateProfilePhoto = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    console.log('Starting migration: Separate profile photo from document verification\n');

    // Find all profiles that have profilePhoto in documents
    const profiles = await DeliveryRiderProfile.find({
      'documents.profilePhoto': { $exists: true }
    });

    console.log(`Found ${profiles.length} profiles with profilePhoto data\n`);

    let updated = 0;
    let skipped = 0;

    for (const profile of profiles) {
      try {
        const profilePhoto = profile.documents?.profilePhoto;
        
        if (profilePhoto) {
          // Log current status
          console.log(`Profile: ${profile.userId}`);
          console.log(`  Current status: ${profilePhoto.status || 'not_uploaded'}`);
          console.log(`  IsVerified: ${profilePhoto.isVerified || false}`);
          console.log(`  Has image: ${!!profilePhoto.imageUrl}`);
          
          // Profile photo remains in schema for storage but is now optional
          // Mark it as verified if it exists to avoid blocking driver activation
          if (profilePhoto.imageUrl && profilePhoto.status === 'pending') {
            profile.documents.profilePhoto.status = 'verified';
            profile.documents.profilePhoto.isVerified = true;
            profile.markModified('documents');
            await profile.save();
            console.log(`  ✅ Updated to verified (now optional)\n`);
            updated++;
          } else {
            console.log(`  ⏭️  No changes needed\n`);
            skipped++;
          }
        }
      } catch (err) {
        console.error(`❌ Error processing profile ${profile.userId}:`, err.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total profiles: ${profiles.length}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log('\n✅ Migration completed successfully!');
    console.log('ℹ️  Profile photo is now optional and uploaded separately via profile page');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

separateProfilePhoto();
