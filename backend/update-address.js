import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://digambermehta2603_db_user:3QWGrKyCGOpImdgX@cluster0.pe4muvt.mongodb.net/door2door?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    console.log('Database:', mongoose.connection.name);
    
    // Use raw MongoDB driver to update
    const db = mongoose.connection.db;
    const collection = db.collection('customerprofiles');
    
    console.log('\nSearching in customerprofiles collection...');
    const count = await collection.countDocuments({});
    console.log('Document count:', count);
    
    // Try to find the specific document
    const result = await collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId('697303c2d19f180df46c3c04') },
      {
        $set: {
          'addresses.0.label': 'Home',
          'addresses.0.street': 'Near Bus Stand',
          'addresses.0.city': 'Jalandhar',
          'addresses.0.province': 'Punjab',
          'addresses.0.postalCode': '144001',
          'addresses.0.country': 'India',
          'addresses.0.latitude': 31.2810,
          'addresses.0.longitude': 75.5960,
          'addresses.0.isDefault': true
        }
      },
      { returnDocument: 'after' }
    );
    
    if (result) {
      console.log('\n✅ Address updated successfully!');
      console.log('New city:', result.addresses[0].city);
      console.log('New coordinates:', result.addresses[0].latitude, result.addresses[0].longitude);
    } else {
      console.log('❌ Document not found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
