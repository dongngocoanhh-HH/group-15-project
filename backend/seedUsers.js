// backend/seedUsers.js - Script tạo users mẫu với các role khác nhau
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: '123456',
    role: 'admin',
    isActive: true,
  },
  {
    name: 'Moderator User',
    email: 'moderator@example.com',
    password: '123456',
    role: 'moderator',
    permissions: ['manage_users', 'manage_posts', 'view_reports'],
    isActive: true,
  },
  {
    name: 'Regular User 1',
    email: 'user1@example.com',
    password: '123456',
    role: 'user',
    isActive: true,
  },
  {
    name: 'Regular User 2',
    email: 'user2@example.com',
    password: '123456',
    role: 'user',
    isActive: true,
  },
  {
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: '123456',
    role: 'user',
    isActive: false,
  },
];

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/groupDB');
    console.log('✅ MongoDB connected');

    // Xóa tất cả users cũ (cẩn thận!)
    // await User.deleteMany({});
    // console.log('🗑️  Deleted all existing users');

    // Tạo users mới
    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⚠️  User ${userData.email} đã tồn tại, bỏ qua...`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n✨ Seed completed!');
    console.log('\n📋 Test accounts:');
    console.log('Admin: admin@example.com / 123456');
    console.log('Moderator: moderator@example.com / 123456');
    console.log('User: user1@example.com / 123456');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seedUsers();
