require('dotenv').config();
const { testEmailConfig, sendResetPasswordEmail } = require('./config/emailService');

async function testEmailSetup() {
  console.log('==========================================');
  console.log('📧 TESTING EMAIL CONFIGURATION');
  console.log('==========================================\n');

  // Check environment variables
  console.log('📋 Checking environment variables...');
  const requiredEnvVars = ['EMAIL_USER', 'EMAIL_PASSWORD', 'CLIENT_URL'];
  let envValid = true;

  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.error(`❌ Missing: ${varName}`);
      envValid = false;
    } else {
      // Mask password for security
      const displayValue = varName === 'EMAIL_PASSWORD' 
        ? `${value.substring(0, 4)}${'*'.repeat(value.length - 4)}`
        : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  });

  if (!envValid) {
    console.error('\n❌ Please set all required environment variables in .env file');
    console.log('See .env.example for reference');
    process.exit(1);
  }

  console.log('\n------------------------------------------');
  console.log('🔧 Testing SMTP connection...');
  console.log('------------------------------------------');

  try {
    const configResult = await testEmailConfig();
    
    if (!configResult.success) {
      console.error('❌ Email configuration is INVALID!');
      console.error('Error:', configResult.message);
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check if EMAIL_USER is correct Gmail address');
      console.log('2. Check if EMAIL_PASSWORD is 16-char App Password (no spaces)');
      console.log('3. Make sure 2-Step Verification is enabled');
      console.log('4. Create new App Password at: https://myaccount.google.com/apppasswords');
      process.exit(1);
    }
    
    console.log('✅ SMTP connection successful!');
    console.log('Message:', configResult.message);

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }

  console.log('\n------------------------------------------');
  console.log('📨 Sending test email...');
  console.log('------------------------------------------');

  try {
    const testEmail = process.env.EMAIL_USER; // Send to yourself
    const testToken = 'test-token-' + Math.random().toString(36).substring(7);
    
    console.log(`📬 Recipient: ${testEmail}`);
    console.log(`🔑 Test Token: ${testToken}`);
    
    const result = await sendResetPasswordEmail(testEmail, testToken, 'Test User');
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\n📧 Please check your email inbox (or spam folder)');
    console.log(`Subject: "🔐 Reset Password Request - Group 15 Project"`);

  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }

  console.log('\n==========================================');
  console.log('✅ ALL TESTS PASSED!');
  console.log('==========================================');
  console.log('\n📝 Next steps:');
  console.log('1. Check your email inbox for the test email');
  console.log('2. Verify the email looks good (HTML formatting, button works)');
  console.log('3. Start your backend server: npm start');
  console.log('4. Test the API endpoints with Postman');
  console.log('5. See TESTING_FORGOT_PASSWORD.md for detailed testing guide');
  console.log('\n🚀 Happy testing!\n');
}

// Run the test
testEmailSetup().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
