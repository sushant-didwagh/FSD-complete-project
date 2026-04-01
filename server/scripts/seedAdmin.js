/**
 * Admin Seed Script
 * Run this ONCE to create the initial admin user.
 * Usage: npm run seed:admin
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const ADMIN = {
  fullName: 'Super Admin',
  email: 'admin@studentbuddy.com',
  password: 'Admin@1234',
  role: 'admin',
};

const seed = async () => {
  await connectDB();

  // Dynamically require after DB is connected to avoid Mongoose model issues
  const User = require('../models/User');

  const existing = await User.findOne({ email: ADMIN.email });
  if (existing) {
    console.log('⚠️  Admin already exists:', ADMIN.email);
    console.log('   You can log in at http://localhost:5173/login');
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash manually to bypass any middleware compatibility issues
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(ADMIN.password, salt);

  const admin = new User({
    fullName: ADMIN.fullName,
    email: ADMIN.email,
    password: hashedPassword,
    role: ADMIN.role,
    isApproved: true,
  });

  // Use save with { validateBeforeSave: false } to skip middleware chain
  admin.isNew = true;
  await User.collection.insertOne({
    fullName: ADMIN.fullName,
    email: ADMIN.email,
    password: hashedPassword,
    role: ADMIN.role,
    isApproved: true,
    profilePic: '',
    subjects: [],
    reviews: [],
    charges: 0,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('\n✅ Admin user created successfully!');
  console.log(`   Email   : ${ADMIN.email}`);
  console.log(`   Password: ${ADMIN.password}`);
  console.log('   🌐 Login : http://localhost:5173/login');
  console.log('   🔒 Please change the password after first login!\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
