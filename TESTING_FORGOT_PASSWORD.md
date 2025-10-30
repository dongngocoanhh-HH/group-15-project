# 📧 Testing Forgot Password & Email Feature

## 🎯 Mục tiêu
Kiểm tra tính năng **Forgot Password** với **email thật** qua Gmail SMTP.

---

## 📋 Yêu cầu

### 1. Gmail Account với App Password
Bạn cần có:
- ✅ Gmail account
- ✅ 2-Step Verification đã bật
- ✅ App Password đã tạo

### 2. Cấu hình `.env` file
Copy từ `.env.example` và điền thông tin:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16-char App Password (không có khoảng trắng)
EMAIL_FROM_NAME=Group 15 Project
CLIENT_URL=http://localhost:3000
```

---

## 🔧 Setup Gmail App Password

### Bước 1: Bật 2-Step Verification
1. Truy cập: https://myaccount.google.com/security
2. Tìm **2-Step Verification**
3. Làm theo hướng dẫn để bật (nếu chưa bật)

### Bước 2: Tạo App Password
1. Truy cập: https://myaccount.google.com/apppasswords
2. **Select app**: Chọn "Mail"
3. **Select device**: Chọn "Other" → Nhập "Group 15 Backend"
4. Click **GENERATE**
5. Copy 16-character password (dạng: `abcd efgh ijkl mnop`)
6. **Quan trọng**: Xóa hết khoảng trắng khi paste vào `.env`
   ```
   ✅ Đúng: abcdefghijklmnop
   ❌ Sai:  abcd efgh ijkl mnop
   ```

### Bước 3: Cập nhật `.env`
```bash
cd backend
# Copy example file
copy .env.example .env

# Edit .env và điền thông tin
notepad .env
```

Ví dụ `.env`:
```env
EMAIL_USER=group15project@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Group 15 - RMIT University
CLIENT_URL=http://localhost:3000
```

---

## 🚀 Testing Steps

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Test Email Configuration (Optional)
Tạo file test script `backend/testEmail.js`:

```javascript
require('dotenv').config();
const { testEmailConfig, sendResetPasswordEmail } = require('./config/emailService');

async function test() {
  // Test 1: Kiểm tra config
  console.log('Testing email configuration...');
  const configResult = await testEmailConfig();
  console.log('Config result:', configResult);
  
  if (!configResult.success) {
    console.error('❌ Email config invalid!');
    return;
  }
  
  // Test 2: Gửi email thử
  console.log('\nSending test email...');
  try {
    const result = await sendResetPasswordEmail(
      process.env.EMAIL_USER, // Gửi cho chính mình
      'test-token-123456789',
      'Test User'
    );
    console.log('✅ Email sent successfully:', result);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
}

test();
```

Chạy test:
```bash
node testEmail.js
```

**Expected output**:
```
Testing email configuration...
✅ Email configuration is valid
Config result: { success: true, message: 'Email configuration is valid' }

Sending test email...
✅ Email sent successfully: { success: true, messageId: '<...@gmail.com>' }
```

### 3. Start Backend Server
```bash
cd backend
npm start
```

Server chạy tại: http://localhost:4000

### 4. Test API với Postman

#### Request 1: Forgot Password
**Endpoint**: `POST http://localhost:4000/api/auth/forgot-password`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "email": "your-test-email@gmail.com"
}
```

**Expected Response** (Success):
```json
{
  "success": true,
  "message": "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
}
```

**Expected Response** (Email config error):
```json
{
  "success": false,
  "message": "Không thể gửi email. Vui lòng thử lại sau hoặc kiểm tra cấu hình email."
}
```

#### Request 2: Check Email
1. Mở Gmail của bạn
2. Tìm email với tiêu đề: **"🔐 Reset Password Request - Group 15 Project"**
3. Click nút **"Reset Password"** hoặc copy token từ email

#### Request 3: Reset Password
**Endpoint**: `POST http://localhost:4000/api/auth/reset-password`

**Body** (JSON):
```json
{
  "token": "paste-token-from-email-here",
  "password": "NewPassword123!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công. Hãy đăng nhập lại với mật khẩu mới."
}
```

#### Request 4: Login với Password mới
**Endpoint**: `POST http://localhost:4000/api/auth/login`

**Body**:
```json
{
  "email": "your-test-email@gmail.com",
  "password": "NewPassword123!"
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "user": { ... }
}
```

---

## 📧 Email Template Preview

### Email 1: Reset Password Request
- **Subject**: 🔐 Reset Password Request - Group 15 Project
- **Content**: 
  - Welcome message với tên user
  - Button "Reset Password" (link đến frontend)
  - Copy-paste link và token
  - Warning: Link expires in 10 minutes
- **Design**: Gradient header (purple), responsive HTML

### Email 2: Password Changed Confirmation
- **Subject**: ✅ Password Changed Successfully - Group 15 Project
- **Content**:
  - Xác nhận password đã đổi thành công
  - Warning nếu không phải bạn thay đổi
  - Contact support instructions
- **Design**: Green header with success icon

---

## 🐛 Troubleshooting

### ❌ Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Nguyên nhân**: 
- Sai App Password
- Chưa bật 2-Step Verification
- Copy nhầm khoảng trắng trong password

**Giải pháp**:
1. Kiểm tra lại App Password (xóa khoảng trắng)
2. Tạo lại App Password mới
3. Đảm bảo 2-Step Verification đã bật

### ❌ Error: "self signed certificate in certificate chain"
**Nguyên nhân**: SSL issue

**Giải pháp**: Update `emailService.js`:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { ... },
  tls: {
    rejectUnauthorized: false // Add this
  }
});
```

### ❌ Email không nhận được
**Kiểm tra**:
1. ✅ Spam folder
2. ✅ Email USER có đúng không?
3. ✅ Backend console có log "✅ Email sent successfully"?
4. ✅ Network firewall có block port 587?

**Debug**:
```javascript
// Add to emailService.js
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Nodemailer Error:', error);
  } else {
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
});
```

### ❌ Token expired
**Nguyên nhân**: Token hết hạn sau 10 phút

**Giải pháp**: Request lại forgot-password để nhận token mới

---

## ✅ Testing Checklist

- [ ] Cài đặt nodemailer: `npm install nodemailer`
- [ ] Tạo Gmail App Password
- [ ] Cập nhật `.env` với EMAIL_USER, EMAIL_PASSWORD
- [ ] Chạy `node testEmail.js` → ✅ Pass
- [ ] Start server: `npm start`
- [ ] POST `/api/auth/forgot-password` → Response success
- [ ] Kiểm tra email nhận được (inbox hoặc spam)
- [ ] Email có button "Reset Password" + token
- [ ] Click link hoặc copy token
- [ ] POST `/api/auth/reset-password` với token + password mới
- [ ] Login với password mới thành công
- [ ] Nhận email xác nhận "Password Changed Successfully"
- [ ] Test token hết hạn (đợi 10 phút) → Error "Token không hợp lệ"
- [ ] Test email không tồn tại → Response success (bảo mật)

---

## 📚 References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail Guide](https://nodemailer.com/usage/using-gmail/)

---

## 🎓 Notes cho Sinh viên

### SV1: API Implementation
- ✅ `POST /api/auth/forgot-password` - Generate token + gửi email
- ✅ `POST /api/auth/reset-password` - Verify token + update password
- ✅ Error handling với try-catch
- ✅ Security: Hash token SHA256 trước khi lưu DB
- ✅ Security: Không reveal email có tồn tại hay không

### SV2: Frontend Integration
- ✅ Page `ForgotPassword.jsx` đã có sẵn
- ✅ Page `ResetPassword.jsx` đã có sẵn
- 🔄 Cần verify form validation và error handling

### SV3: Email Service
- ✅ Nodemailer với Gmail SMTP
- ✅ HTML email template responsive
- ✅ 2 email types: Reset Request + Password Changed
- ✅ Token expires sau 10 phút
- ✅ Test email configuration function

### Điểm cộng:
- ✨ Beautiful HTML email design
- ✨ Security best practices (hash token, không reveal user existence)
- ✨ Error handling cho email sending failures
- ✨ Confirmation email sau khi đổi password
- ✨ Console logging cho debugging

---

**Good luck! 🚀**
