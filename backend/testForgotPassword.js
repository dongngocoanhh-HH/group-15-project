// Quick test: Gửi forgot password request
const axios = require('axios');

async function testForgotPassword() {
  try {
    console.log('🚀 Testing Forgot Password API...\n');
    
    const response = await axios.post('http://localhost:4000/api/auth/forgot-password', {
      email: 'dongoanh4112004@gmail.com'
    });
    
    console.log('✅ Success!');
    console.log('Response:', response.data);
    console.log('\n📧 Check your email: dongoanh4112004@gmail.com');
    console.log('Subject: "🔐 Reset Password Request - Group 15 Project"');
    console.log('\n📝 Copy the token from email and use it to reset password');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testForgotPassword();
