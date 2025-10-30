# 🔐 Hoạt động 4 - Forgot Password & Reset Password (Email thật)

## 📌 Tổng quan

Tính năng **Forgot Password** cho phép user reset mật khẩu khi quên, sử dụng **email thật** qua **Gmail SMTP** với **Nodemailer**.

---

## ✨ Features

### 1️⃣ Backend API
- ✅ `POST /api/auth/forgot-password` - Tạo token và gửi email
- ✅ `POST /api/auth/reset-password` - Verify token và đổi mật khẩu
- ✅ Email service với Nodemailer + Gmail SMTP
- ✅ HTML email templates responsive
- ✅ Token expires sau 10 phút
- ✅ Security: Hash token với SHA256

### 2️⃣ Email Templates
- ✅ **Reset Password Request Email**: 
  - Beautiful HTML design với gradient header
  - Button "Reset Password" link đến frontend
  - Token display cho manual copy
  - Warning về expiration (10 phút)
  - Plain text fallback
  
- ✅ **Password Changed Confirmation Email**:
  - Notify user khi password đã đổi thành công
  - Security warning nếu không phải user tự đổi

### 3️⃣ Security
- ✅ Token được hash SHA256 trước khi lưu DB
- ✅ Token expires sau 10 phút (configurable)
- ✅ Không reveal email có tồn tại hay không (timing attack prevention)
- ✅ Xóa token sau khi sử dụng
- ✅ Gửi confirmation email khi đổi password

---

## 📂 File Structure

```
backend/
├── config/
│   └── emailService.js          # Nodemailer configuration + email templates
├── controllers/
│   └── authController.js        # Updated: forgotPassword, resetPassword
├── models/
│   └── User.js                  # Has resetPasswordToken, resetPasswordExpires
├── routes/
│   └── authRoutes.js           # POST /forgot-password, /reset-password
├── .env                         # Email credentials (create from .env.example)
├── .env.example                # Template với hướng dẫn Gmail App Password
├── testEmail.js                # Test script để verify email config
└── package.json                # Added: nodemailer ^6.9.7

frontend/src/pages/
├── ForgotPassword.jsx          # Form nhập email (already exists)
└── ResetPassword.jsx           # Form nhập token + password mới (already exists)

root/
└── TESTING_FORGOT_PASSWORD.md  # Hướng dẫn setup Gmail và testing
```

---

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install nodemailer
```

### 2. Configure Gmail App Password

#### Bước 1: Bật 2-Step Verification
1. Truy cập: https://myaccount.google.com/security
2. Tìm **2-Step Verification** → Bật nếu chưa có

#### Bước 2: Tạo App Password
1. Truy cập: https://myaccount.google.com/apppasswords
2. **Select app**: Mail
3. **Select device**: Other → Nhập "Group 15 Backend"
4. Click **GENERATE**
5. Copy 16-character password (ví dụ: `abcd efgh ijkl mnop`)

#### Bước 3: Update `.env` file
```bash
cd backend
copy .env.example .env
notepad .env
```

Điền thông tin:
```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # 16 chars, NO SPACES
EMAIL_FROM_NAME=Group 15 Project
CLIENT_URL=http://localhost:3000
```

**⚠️ QUAN TRỌNG**: Xóa hết khoảng trắng trong App Password!
- ✅ Đúng: `abcdefghijklmnop`
- ❌ Sai: `abcd efgh ijkl mnop`

### 3. Test Email Configuration

```bash
cd backend
node testEmail.js
```

**Expected output**:
```
==========================================
📧 TESTING EMAIL CONFIGURATION
==========================================

📋 Checking environment variables...
✅ EMAIL_USER: your-email@gmail.com
✅ EMAIL_PASSWORD: abcd************
✅ CLIENT_URL: http://localhost:3000

------------------------------------------
🔧 Testing SMTP connection...
------------------------------------------
✅ SMTP connection successful!
Message: Email configuration is valid

------------------------------------------
📨 Sending test email...
------------------------------------------
📬 Recipient: your-email@gmail.com
🔑 Test Token: test-token-abc123
✅ Test email sent successfully!
Message ID: <...@gmail.com>

📧 Please check your email inbox (or spam folder)
Subject: "🔐 Reset Password Request - Group 15 Project"

==========================================
✅ ALL TESTS PASSED!
==========================================
```

### 4. Kiểm tra Email
1. Mở Gmail của bạn
2. Tìm email: **"🔐 Reset Password Request - Group 15 Project"**
3. Verify:
   - ✅ Email có formatting đẹp (gradient header)
   - ✅ Button "Reset Password" hoạt động
   - ✅ Token hiển thị đầy đủ

---

## 🚀 API Documentation

### 1. Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
}
```

**Response** (Email service error):
```json
{
  "success": false,
  "message": "Không thể gửi email. Vui lòng thử lại sau hoặc kiểm tra cấu hình email."
}
```

**Behavior**:
- Tìm user theo email
- Tạo random token (32 bytes hex)
- Hash token với SHA256 và lưu vào DB
- Set expiration time (10 phút)
- Gửi email với reset link
- **Security**: Luôn return success nếu email không tồn tại (tránh email enumeration)

**Email Content**:
- Reset link: `http://localhost:3000/reset-password?token={plainToken}`
- Token expires in: 10 minutes
- HTML template với button và token display

---

### 2. Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "abc123def456...",
  "password": "NewPassword123!"
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công. Hãy đăng nhập lại với mật khẩu mới."
}
```

**Response** (Invalid/Expired Token):
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu reset lại."
}
```

**Behavior**:
- Hash token từ request
- Tìm user với token hash + chưa expired
- Cập nhật password mới (bcrypt auto-hash)
- Xóa resetPasswordToken và resetPasswordExpires
- Gửi confirmation email
- Return success message

---

## 📧 Email Service API

Located in `backend/config/emailService.js`

### Functions

#### 1. `sendResetPasswordEmail(to, resetToken, userName)`
Gửi email reset password với HTML template

**Parameters**:
- `to` (string): Email người nhận
- `resetToken` (string): Plain token (chưa hash)
- `userName` (string): Tên user để personalize email

**Returns**: `{ success: true, messageId: '...' }`

**Throws**: Error nếu gửi thất bại

---

#### 2. `sendPasswordChangedEmail(to, userName)`
Gửi email xác nhận password đã đổi thành công

**Parameters**:
- `to` (string): Email người nhận
- `userName` (string): Tên user

**Returns**: `{ success: true, messageId: '...' }`

---

#### 3. `testEmailConfig()`
Test SMTP connection để verify config

**Returns**: 
- Success: `{ success: true, message: 'Email configuration is valid' }`
- Error: `{ success: false, message: 'Error message' }`

---

## 🧪 Testing với Postman

### Test Flow

1. **Forgot Password**
   ```
   POST http://localhost:4000/api/auth/forgot-password
   Body: { "email": "test@example.com" }
   → Check email inbox
   ```

2. **Copy Token từ Email**
   - Mở email "Reset Password Request"
   - Copy token từ email hoặc click button

3. **Reset Password**
   ```
   POST http://localhost:4000/api/auth/reset-password
   Body: { 
     "token": "paste-from-email",
     "password": "NewPassword123!" 
   }
   → Check confirmation email
   ```

4. **Login với Password mới**
   ```
   POST http://localhost:4000/api/auth/login
   Body: { 
     "email": "test@example.com",
     "password": "NewPassword123!" 
   }
   → Should succeed
   ```

### Postman Collection
Import file: `RBAC_API.postman_collection.json` hoặc `Refresh_Token_API.postman_collection.json`

Add requests:
- Forgot Password
- Reset Password

---

## 🐛 Troubleshooting

### ❌ "Invalid login: 535-5.7.8 Username and Password not accepted"

**Nguyên nhân**:
- Sai App Password
- Chưa bật 2-Step Verification
- Copy nhầm khoảng trắng

**Giải pháp**:
1. Tạo lại App Password mới
2. Xóa hết khoảng trắng: `abcdefghijklmnop` (16 chars liền)
3. Verify 2-Step Verification đã bật

---

### ❌ Email không nhận được

**Kiểm tra**:
1. ✅ Spam folder
2. ✅ Backend console có log "✅ Email sent successfully"?
3. ✅ EMAIL_USER có đúng?
4. ✅ Network có block port 587?

**Debug**: Chạy `node testEmail.js` để test riêng email service

---

### ❌ Token expired

**Nguyên nhân**: Token hết hạn sau 10 phút

**Giải pháp**: Request lại `/forgot-password` để nhận token mới

---

### ❌ "self signed certificate in certificate chain"

**Giải pháp**: Update `emailService.js`:
```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { ... },
  tls: {
    rejectUnauthorized: false // Add this line
  }
});
```

---

## 📚 Code Examples

### Example: Custom Email Template

Edit `backend/config/emailService.js`:

```javascript
exports.sendResetPasswordEmail = async (to, resetToken, userName) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Group 15" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Reset Your Password',
    html: `
      <h1>Hi ${userName}!</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Token expires in 10 minutes.</p>
    `
  };
  
  const transporter = createTransporter();
  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};
```

### Example: Change Token Expiration

Edit `authController.js`:

```javascript
// Change from 10 minutes to 30 minutes
user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
```

---

## 🎓 Implementation Details

### SV1: Backend API ✅
- File: `backend/controllers/authController.js`
- Functions: `forgotPassword()`, `resetPassword()`
- Security: SHA256 hash, token expiration, no email enumeration
- Error handling: Try-catch, specific error messages

### SV2: Frontend Pages ✅
- Files: `frontend/src/pages/ForgotPassword.jsx`, `ResetPassword.jsx`
- Status: Already exist (pre-built)
- Note: Verify form validation and error display

### SV3: Email Service ✅
- File: `backend/config/emailService.js`
- Tech: Nodemailer + Gmail SMTP
- Features: 2 email templates (HTML + plain text)
- Test script: `backend/testEmail.js`

---

## 📊 Workflow Diagram

```
User                Frontend              Backend               Gmail SMTP
  |                    |                     |                      |
  |-- Enter email ---->|                     |                      |
  |                    |-- POST /forgot ---->|                      |
  |                    |                     |-- Generate token --->|
  |                    |                     |-- Hash & save to DB  |
  |                    |                     |-- Send email ------->|
  |                    |                     |                      |
  |<---------------- Email received ----------------------<---------|
  |                    |                     |                      |
  |-- Click link ----->|                     |                      |
  |-- Enter new pwd -->|                     |                      |
  |                    |-- POST /reset ----->|                      |
  |                    |                     |-- Verify hash token  |
  |                    |                     |-- Update password    |
  |                    |                     |-- Send confirm ----->|
  |                    |<-- Success ---------|                      |
  |<--- Redirect to login                    |                      |
```

---

## ✅ Testing Checklist

- [ ] Install nodemailer
- [ ] Setup Gmail App Password
- [ ] Update `.env` file
- [ ] Run `node testEmail.js` → PASS
- [ ] Receive test email in inbox
- [ ] Start server: `npm start`
- [ ] POST `/forgot-password` → Success response
- [ ] Receive reset email (check spam too)
- [ ] Email has working button + token
- [ ] POST `/reset-password` → Success
- [ ] Receive confirmation email
- [ ] Login với password mới → Success
- [ ] Test expired token (wait 10 min) → Error
- [ ] Test invalid token → Error
- [ ] Test non-existent email → Success (security)

---

## 📖 References

- [Nodemailer Documentation](https://nodemailer.com/)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [OWASP Password Reset](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)

---

## 🎯 Future Enhancements

- [ ] Rate limiting cho forgot-password endpoint (prevent spam)
- [ ] Custom email templates với company branding
- [ ] SMS reset option (Twilio)
- [ ] 2FA support
- [ ] Email templates internationalization (i18n)
- [ ] Analytics tracking (email open rate, click rate)
- [ ] Queue system cho email (Bull/Redis)

---

**Created by**: Group 15  
**Course**: Web Programming  
**Last Updated**: 2025-01-12

🚀 **Happy coding!**
