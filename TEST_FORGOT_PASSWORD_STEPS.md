# 🧪 Test Forgot Password - Step by Step

## Bước 1: Gửi request Forgot Password

### Dùng Postman:
```
POST http://localhost:4000/api/auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "dongoanh4112004@gmail.com"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
}
```

---

## Bước 2: Check Email

1. Mở Gmail: **dongoanh4112004@gmail.com**
2. Tìm email: **"🔐 Reset Password Request - Group 15 Project"**
3. Nếu không thấy → Check **Spam folder**
4. Copy **token** từ email (dài khoảng 64 ký tự)

---

## Bước 3: Reset Password

### Option A: Dùng Frontend
1. Vào: **http://localhost:3000/reset-password**
2. Paste token vừa copy
3. Nhập password mới (tối thiểu 6 ký tự)
4. Nhập lại password
5. Click **"ĐỔI MẬT KHẨU"**

### Option B: Dùng Postman
```
POST http://localhost:4000/api/auth/reset-password
Content-Type: application/json

Body:
{
  "token": "paste-token-from-email-here",
  "password": "newpassword123"
}
```

### Expected Response:
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công. Hãy đăng nhập lại với mật khẩu mới."
}
```

---

## Bước 4: Check Confirmation Email

Sau khi đổi password thành công, check Gmail lại:
- Email mới: **"✅ Password Changed Successfully - Group 15 Project"**

---

## Bước 5: Login với Password mới

```
POST http://localhost:4000/api/auth/login

Body:
{
  "email": "dongoanh4112004@gmail.com",
  "password": "newpassword123"
}
```

---

## ⚠️ Common Issues

### ❌ "Token không hợp lệ hoặc đã hết hạn"
**Nguyên nhân**:
- Token test từ `testEmail.js` (fake token)
- Token đã hết hạn (10 phút)
- Token đã được sử dụng rồi

**Giải pháp**: Request lại forgot-password để nhận token mới

### ❌ Không nhận được email
**Kiểm tra**:
1. Spam folder
2. Backend console có log "✅ Email sent successfully"?
3. Email trong .env đúng chưa?

---

## 🎯 Test Flow Hoàn chỉnh

1. ✅ POST /forgot-password → Response success
2. ✅ Check Gmail → Email received
3. ✅ Copy token từ email
4. ✅ POST /reset-password với token + password mới → Success
5. ✅ Check Gmail → Confirmation email received
6. ✅ POST /login với password mới → Success

---

**Good luck! 🚀**
