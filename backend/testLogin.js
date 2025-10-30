// Script để test login locally
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp');
    console.log('✅ MongoDB connected');

    // Test: Xem tất cả users
    const users = await User.find().select('+password');
    console.log('\n📋 All users in database:');
    users.forEach(user => {
      console.log({
        email: user.email,
        name: user.name,
        role: user.role,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0,
        isHashed: user.password && user.password.startsWith('$2a$') // bcrypt hash starts with $2a$
      });
    });

    // Test login với một user
    if (users.length > 0) {
      const testUser = users[0];
      console.log('\n🧪 Testing login with:', testUser.email);
      
      try {
        // Test với password đúng (giả sử là '123456')
        const match = await testUser.comparePassword('123456');
        console.log('Password match (123456):', match);
      } catch (err) {
        console.error('Error comparing password:', err.message);
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
