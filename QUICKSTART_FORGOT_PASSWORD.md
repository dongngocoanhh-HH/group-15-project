# 🚀 Quick Start: Forgot Password Setup

## ⚡ 5 bước nhanh để setup email

### 1️⃣ Install nodemailer
```bash
cd backend
npm install nodemailer
```

### 2️⃣ Tạo Gmail App Password

1. Truy cập: **https://myaccount.google.com/apppasswords**
2. Chọn **app**: Mail
3. Chọn **device**: Other → Nhập "Group 15 Backend"
4. Click **GENERATE**
5. Copy **16 ký tự** (ví dụ: `abcd efgh ijkl mnop`)

### 3️⃣ Create .env file
```bash
cd backend
copy .env.example .env
notepad .env
```

### 4️⃣ Paste vào .env (XÓA khoảng trắng!)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM_NAME=Group 15 Project
CLIENT_URL=http://localhost:3000
```

⚠️ **QUAN TRỌNG**: Password phải **16 ký tự liền**, KHÔNG có khoảng trắng!

### 5️⃣ Test email
```bash
cd backend
node testEmail.js
```

**Expected output**:
```
==========================================
📧 TESTING EMAIL CONFIGURATION
==========================================

✅ EMAIL_USER: your-email@gmail.com
✅ EMAIL_PASSWORD: abcd************
✅ CLIENT_URL: http://localhost:3000

------------------------------------------
🔧 Testing SMTP connection...
------------------------------------------
✅ SMTP connection successful!

------------------------------------------
📨 Sending test email...
------------------------------------------
📬 Recipient: your-email@gmail.com
✅ Test email sent successfully!

==========================================
✅ ALL TESTS PASSED!
==========================================
```

### ✅ Done! Start server
```bash
npm start
```

---

## 🧪 Test API với Postman

### 1. Forgot Password
```
POST http://localhost:4000/api/auth/forgot-password
Body: {
  "email": "your-email@gmail.com"
}
```

### 2. Check Email
- Mở Gmail → Tìm email **"🔐 Reset Password Request"**
- Click button **"Reset Password"**

### 3. Reset Password
```
POST http://localhost:4000/api/auth/reset-password
Body: {
  "token": "paste-from-email",
  "password": "NewPassword123!"
}
```

### 4. Login
```
POST http://localhost:4000/api/auth/login
Body: {
  "email": "your-email@gmail.com",
  "password": "NewPassword123!"
}
```

---

## 🐛 Troubleshooting

### ❌ "Invalid login: 535-5.7.8"
→ Tạo lại App Password, xóa khoảng trắng

### ❌ Email không nhận được
→ Check spam folder
→ Run `node testEmail.js` để debug

### ❌ Token expired
→ Request lại forgot-password (token hết hạn sau 10 phút)

---

## 📖 Chi tiết
Xem **TESTING_FORGOT_PASSWORD.md** để biết thêm chi tiết!

**Good luck! 🚀**
