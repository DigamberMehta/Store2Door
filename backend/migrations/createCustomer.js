import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import CustomerProfile from '../models/CustomerProfile.js';

dotenv.config();

const createCustomer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/door2door');
    console.log('✅ Connected to MongoDB');

    const customerEmail = 'customer@door2door.com';
    const customerPhone = '9876543210';

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email: customerEmail }, { phone: customerPhone }] });
    if (existingUser) {
      console.log('⚠️  User with this email or phone already exists.');
      await mongoose.connection.close();
      return;
    }

    // Create user
    const user = await User.create({
      name: 'John Doe',
      email: customerEmail,
      phone: customerPhone,
      password: 'password123',
      role: 'customer',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true
    });

    // Create customer profile
    await CustomerProfile.create({
      userId: user._id,
      addresses: [
        {
          label: 'Home',
          street: 'Adarsh Nagar, Phagwara Sharki, Law Gate Road, Near LPU',
          city: 'Phagwara',
          province: 'Punjab',
          postalCode: '144401',
          country: 'India',
          latitude: 31.2587,
          longitude: 75.6965,
          isDefault: true
        }
      ]
    });

    console.log('\n🎉 Customer user created successfully!');
    console.log('-----------------------------------');
    console.log(`Email:    ${customerEmail}`);
    console.log(`Phone:    ${customerPhone}`);
    console.log(`Password: password123`);
    console.log(`Role:     customer`);
    console.log('-----------------------------------');

  } catch (error) {
    console.error('❌ Error creating customer:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

createCustomer();
