import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

async function seedAdmin() {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/hybrid-ai-agent';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@lmina.ai' });
    if (existing) {
      await User.deleteOne({ _id: existing._id });
      console.log('Removed old admin user (was double-hashed)');
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@lmina.ai',
      phone: '+1234567890',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      isVerified: true,
      theme: 'corporate',
    });

    console.log('Admin user created successfully!');
    console.log('Email:    admin@lmina.ai');
    console.log('Password: admin123');
    console.log('Role:     admin');
    console.log('ID:       ' + admin._id);

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
