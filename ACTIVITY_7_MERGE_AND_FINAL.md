# Hoạt động 7 – Tổng hợp & Merge vào Main

## 🎯 Mục tiêu
Tích hợp toàn bộ tính năng nâng cao vào repo chính, test flow đầy đủ từ đầu đến cuối.

## 📋 Nội dung thực hành
1. Merge tất cả nhánh feature vào main
2. Test toàn bộ flow: đăng ký → đăng nhập → refresh token → upload avatar → reset password
3. Xem logs và phân quyền theo role
4. Cập nhật README.md hướng dẫn chạy ứng dụng
5. Chuẩn bị video demo và screenshots

---

## 🔀 PHẦN 1: Merge tất cả nhánh vào Main

### Bước 1.1: Kiểm tra tất cả các nhánh feature đã có

```bash
# Xem tất cả branches
git branch -a

# Kết quả mong đợi:
#   main
#   feature/rbac
#   feature/refresh-token
#   feature/forgot-password
#   feature/avatar-upload
#   feature/log-rate-limit
# * feature/redux-protected
```

### Bước 1.2: Đảm bảo tất cả nhánh đã push lên remote

```bash
# Push nhánh hiện tại (feature/redux-protected)
git push origin feature/redux-protected

# Kiểm tra remote branches
git branch -r
```

### Bước 1.3: Tạo Pull Requests trên GitHub

**Thứ tự merge (quan trọng!):**

#### PR 1: `feature/rbac` → `main`
1. Vào GitHub: https://github.com/dongngocoanhh-HH/group-15-project/pulls
2. Click **New Pull Request**
3. Base: `main`, Compare: `feature/rbac`
4. Title: `Feature: Role-Based Access Control (RBAC)`
5. Description:
   ```
   ## Hoạt động 2 - RBAC
   
   ### Changes:
   - ✅ User model với roles: user, moderator, admin
   - ✅ Middleware requireRole() cho authorization
   - ✅ Admin routes: GET /api/admin/users, PUT /api/admin/users/:id/role
   - ✅ Frontend Admin Dashboard
   
   ### Testing:
   - Postman collection: RBAC_API.postman_collection.json
   - Screenshots included
   ```
6. Click **Create Pull Request**
7. Click **Merge Pull Request** → **Confirm merge**

#### PR 2: `feature/refresh-token` → `main`
1. New Pull Request
2. Base: `main`, Compare: `feature/refresh-token`
3. Title: `Feature: Refresh Token & Session Management`
4. Description:
   ```
   ## Hoạt động 3 - Refresh Token
   
   ### Changes:
   - ✅ RefreshToken model với expiry tracking
   - ✅ POST /api/auth/refresh endpoint
   - ✅ POST /api/auth/logout với token revocation
   - ✅ Frontend auto-refresh token khi expired
   
   ### Testing:
   - Postman collection: Refresh_Token_API.postman_collection.json
   ```
5. Merge

#### PR 3: `feature/forgot-password` → `main`
1. Base: `main`, Compare: `feature/forgot-password`
2. Title: `Feature: Forgot Password & Email Service`
3. Description:
   ```
   ## Hoạt động 4 - Forgot Password
   
   ### Changes:
   - ✅ Email service (Nodemailer)
   - ✅ POST /api/auth/forgot-password
   - ✅ POST /api/auth/reset-password
   - ✅ Frontend ForgotPassword & ResetPassword pages
   
   ### Testing:
   - Postman collection: Forgot_Password_API.postman_collection.json
   - Email templates tested
   ```
4. Merge

#### PR 4: `feature/avatar-upload` → `main`
1. Base: `main`, Compare: `feature/avatar-upload`
2. Title: `Feature: Avatar Upload with Cloudinary`
3. Description:
   ```
   ## Hoạt động 4b - Avatar Upload
   
   ### Changes:
   - ✅ Cloudinary integration
   - ✅ Multer middleware for file uploads
   - ✅ POST /api/users/profile/avatar
   - ✅ Frontend Profile page with image upload
   
   ### Testing:
   - Upload .jpg, .png, .gif tested
   - Max file size: 5MB
   ```
5. Merge

#### PR 5: `feature/log-rate-limit` → `main`
1. Base: `main`, Compare: `feature/log-rate-limit`
2. Title: `Feature: Activity Logging & Rate Limiting`
3. Description:
   ```
   ## Hoạt động 5 - Activity Logging & Rate Limiting
   
   ### Changes:
   - ✅ ActivityLog model với indexes
   - ✅ logActivity middleware
   - ✅ Rate limiting: 5 login attempts/15min, 3 forgot-password/1hr
   - ✅ Admin Activity Logs UI
   
   ### Testing:
   - Postman collection: Activity_Logging_API.postman_collection.json
   - Rate limit tested (6th request → 429)
   ```
6. Merge

#### PR 6: `feature/redux-protected` → `main`
1. Base: `main`, Compare: `feature/redux-protected`
2. Title: `Feature: Redux Toolkit & Protected Routes`
3. Description:
   ```
   ## Hoạt động 6 - Redux & Protected Routes
   
   ### Changes:
   - ✅ Redux Toolkit store với auth slice
   - ✅ Redux persist vào localStorage
   - ✅ ProtectedRoute component với role-based access
   - ✅ Login/Signup updated to dispatch Redux actions
   
   ### Testing:
   - Postman collection: Redux_Protected_Routes_API.postman_collection.json
   - Redux DevTools screenshots
   ```
7. Merge

### Bước 1.4: Pull main về local sau khi merge

```bash
# Checkout về main
git checkout main

# Pull tất cả changes từ remote
git pull origin main

# Xác nhận tất cả features đã merge
git log --oneline --graph -10
```

---

## ✅ PHẦN 2: Test toàn bộ Flow End-to-End

### Chuẩn bị Test Environment

#### 2.1. Khởi động Backend
```bash
cd backend
npm install
npm run dev
```

Chờ thấy:
```
✓ Server running on port 5000
✓ MongoDB connected successfully
```

#### 2.2. Khởi động Frontend
```bash
cd frontend/frontend
npm install
npm start
```

Browser tự mở: http://localhost:3000

#### 2.3. Reset Database (Optional)
```bash
cd backend
node seedUsers.js
```

---

### Test Flow 1: Đăng ký User mới

#### Bước 1: Frontend Signup
1. Vào: http://localhost:3000/signup
2. Điền:
   - Name: `Test User Flow`
   - Email: `testflow@example.com`
   - Password: `password123`
3. Click **Sign Up**

**Kết quả mong đợi:**
- ✅ Status 200/201
- ✅ Redirect về `/login` hoặc `/profile`
- ✅ ActivityLog ghi nhận: `REGISTER`

#### Bước 2: Kiểm tra Database
```bash
# MongoDB Compass hoặc mongo shell
db.users.findOne({ email: "testflow@example.com" })
# → Thấy user mới với role: "user"

db.activitylogs.find({ email: "testflow@example.com" }).sort({ timestamp: -1 })
# → Thấy action: "REGISTER", status: "SUCCESS"
```

#### Bước 3: Postman Verify
- Collection: `Redux_Protected_Routes_API.postman_collection.json`
- Request: `1.1 Login - User Thường`
- Body: `{ "email": "testflow@example.com", "password": "password123" }`
- Send → Status 200 ✅

**Screenshot 1:** Signup success page

---

### Test Flow 2: Đăng nhập & Redux State

#### Bước 1: Login trên Frontend
1. Vào: http://localhost:3000/login
2. Mở Redux DevTools (F12 → Redux tab)
3. Login:
   - Email: `testflow@example.com`
   - Password: `password123`

**Kết quả mong đợi:**
- ✅ Redux Action: `auth/loginUser/pending` → `auth/loginUser/fulfilled`
- ✅ State:
  ```json
  {
    "auth": {
      "user": { "email": "testflow@example.com", "role": "user" },
      "accessToken": "eyJ...",
      "loading": false,
      "error": null
    }
  }
  ```
- ✅ Redirect về `/profile`
- ✅ ActivityLog: `LOGIN` action

**Screenshot 2:** Redux DevTools showing login action + state

#### Bước 2: Kiểm tra LocalStorage
1. F12 → Application → Local Storage → http://localhost:3000
2. Tìm key: `persist:root`

**Kết quả:**
- ✅ Value chứa auth state (user + accessToken)
- ✅ Có `_persist.rehydrated: true`

**Screenshot 3:** LocalStorage persist:root

---

### Test Flow 3: Refresh Token

#### Bước 1: Đợi Access Token hết hạn (15 phút)
**Hoặc test nhanh:**

1. F12 → Application → Local Storage
2. Xóa `accessToken` (giữ nguyên `refreshToken`)
3. Reload trang → Auto refresh token
4. Redux DevTools xem action

**Kết quả mong đợi:**
- ✅ API call: POST /api/auth/refresh
- ✅ Response: New accessToken
- ✅ Redux state updated với token mới
- ✅ User vẫn logged in (không redirect)

#### Bước 2: Postman Test Refresh
- Collection: `Refresh_Token_API.postman_collection.json`
- Request: `4.1 Refresh Token - User`
- Body: `{ "refreshToken": "..." }`
- Send → Status 200, new accessToken ✅

**Screenshot 4:** Postman refresh token success

---

### Test Flow 4: Upload Avatar

#### Bước 1: Upload trên Frontend
1. Login (nếu chưa)
2. Vào: http://localhost:3000/profile
3. Click **Choose File** → Chọn ảnh (.jpg, .png)
4. Click **Upload Avatar**

**Kết quả mong đợi:**
- ✅ Cloudinary upload thành công
- ✅ Avatar URL updated trong database
- ✅ Ảnh hiển thị ngay trên Profile page
- ✅ ActivityLog: `AVATAR_UPLOAD`

#### Bước 2: Verify Database
```bash
db.users.findOne({ email: "testflow@example.com" })
# → avatarUrl: "https://res.cloudinary.com/..."
```

**Screenshot 5:** Profile page with uploaded avatar

---

### Test Flow 5: Forgot Password & Reset

#### Bước 1: Request Reset Token
1. Logout
2. Vào: http://localhost:3000/forgot-password
3. Nhập email: `testflow@example.com`
4. Click **Send Reset Link**

**Kết quả mong đợi:**
- ✅ Status 200
- ✅ Email gửi tới (kiểm tra Mailtrap/Gmail)
- ✅ User.resetPasswordToken được set
- ✅ ActivityLog: `PASSWORD_RESET_REQUEST`

#### Bước 2: Lấy Reset Token
**Cách 1: Từ Email**
- Mở email → Click link reset → Lấy token từ URL

**Cách 2: Từ Database**
```bash
db.users.findOne({ email: "testflow@example.com" }, { resetPasswordToken: 1 })
```

#### Bước 3: Reset Password
1. Vào: http://localhost:3000/reset-password?token=ABC123...
2. Nhập:
   - New Password: `newpassword123`
   - Confirm: `newpassword123`
3. Click **Reset Password**

**Kết quả mong đợi:**
- ✅ Status 200
- ✅ Password updated trong database
- ✅ resetPasswordToken xóa
- ✅ Email xác nhận password changed
- ✅ Redirect về `/login`

#### Bước 4: Login với mật khẩu mới
- Email: `testflow@example.com`
- Password: `newpassword123`
- Click Login → Success ✅

**Screenshot 6:** Reset password success + login with new password

---

### Test Flow 6: Activity Logs & Role-Based Access

#### Bước 1: Login as User - Xem Logs cá nhân
1. Login: `testflow@example.com`
2. Vào: http://localhost:3000/profile
3. Không thấy Activity Logs (user không có quyền)

#### Bước 2: Try Access Admin Page (Should Fail)
1. Vào: http://localhost:3000/admin
2. **Kết quả:**
   - ❌ Redirect về `/` (Home)
   - ✅ Console: "Access denied: insufficient permissions"

**Screenshot 7:** User denied access to admin page

#### Bước 3: Login as Admin
1. Logout
2. Login:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Vào: http://localhost:3000/admin

**Kết quả:**
- ✅ Hiển thị Admin Dashboard
- ✅ Tab 1: Manage Users
  - Danh sách users
  - Có thể change role
- ✅ Tab 2: Activity Logs
  - Table với filters (Action, Status)
  - Pagination
  - Statistics cards

#### Bước 4: Xem Activity Logs của testflow@example.com
1. Tab Activity Logs
2. Filter: Action = "All", Status = "All"
3. Tìm logs của `testflow@example.com`

**Kết quả mong đợi - Thấy các actions:**
- ✅ REGISTER
- ✅ LOGIN (multiple times)
- ✅ AVATAR_UPLOAD
- ✅ PASSWORD_RESET_REQUEST
- ✅ PROFILE_UPDATE (sau reset password)

**Screenshot 8:** Admin viewing activity logs with filters

---

### Test Flow 7: Rate Limiting

#### Bước 1: Test Login Rate Limit
1. Logout tất cả
2. Postman:
   - Collection: `Activity_Logging_API.postman_collection.json`
   - Request: `2.1 Login 6 Times - Rate Limit Test`
   - Run 6 lần liên tục

**Kết quả:**
- Request 1-5: Status 200 hoặc 401 (nếu sai password) ✅
- Request 6: **Status 429 Too Many Requests** ✅
- Headers:
  ```
  X-RateLimit-Limit: 5
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1234567890
  Retry-After: 900
  ```

**Screenshot 9:** Postman showing 429 rate limit response

#### Bước 2: Test Forgot Password Rate Limit
- Request: `2.3 Forgot Password 4 Times - Rate Limit`
- Run 4 lần → 4th request: 429 ✅
- Limit: 3 requests/1hr

---

### Test Flow 8: Protected Routes với Redux

#### Bước 1: Access /profile khi chưa login
1. Xóa localStorage: `persist:root`
2. Vào: http://localhost:3000/profile

**Kết quả:**
- ✅ Redirect về `/login`
- ✅ Redux state: user = null, accessToken = null

#### Bước 2: Login và kiểm tra Persistence
1. Login: `admin@example.com`
2. Vào: http://localhost:3000/admin → OK ✅
3. F5 Refresh trang
4. **Kết quả:**
   - ✅ Vẫn ở `/admin` (không logout)
   - ✅ Redux state persist
   - ✅ User info hiển thị đúng

**Screenshot 10:** Redux state persists after page refresh

---

## 📝 PHẦN 3: Cập nhật README.md

### Bước 3.1: Tạo README.md toàn diện

<function_calls>
<invoke name="file_search">
<parameter name="query">README.md