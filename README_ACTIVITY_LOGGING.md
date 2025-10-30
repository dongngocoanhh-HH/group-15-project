# 📊 Activity Logging & Rate Limiting - Group 15 Project

## 🎯 Hoạt động 5: User Activity Logging & Rate Limiting

### Mục tiêu
- Ghi lại tất cả hoạt động của người dùng trong hệ thống
- Chống brute force attack bằng rate limiting
- Hiển thị logs và thống kê cho Admin

---

## ✨ Tính năng đã triển khai

### SV1: Backend - Middleware & Rate Limiting ✅

#### 1. **Middleware `logActivity`** (`backend/middleware/logActivity.js`)
```javascript
// Tự động log mọi hoạt động
logActivity(action, options)
```

**Features:**
- ✅ Ghi log với userId, action, timestamp, IP address, userAgent
- ✅ Hỗ trợ các action types:
  - `LOGIN`, `LOGOUT`, `REGISTER`
  - `LOGIN_FAILED` (quan trọng cho security)
  - `PASSWORD_RESET_REQUEST`, `PASSWORD_RESET_SUCCESS`, `PASSWORD_CHANGED`
  - `PROFILE_UPDATE`, `AVATAR_UPLOAD`
  - `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`, `ROLE_CHANGED`
  - `VIEW_USERS`, `VIEW_LOGS`
- ✅ Auto-detect status (SUCCESS/FAILED) dựa trên response
- ✅ Capture details tùy theo action type
- ✅ Non-blocking (async) - không làm chậm response

**Cách sử dụng:**
```javascript
// Trong routes
router.post('/login', logActivity('LOGIN'), loginController);
router.put('/profile', protect, logActivity('PROFILE_UPDATE'), updateProfile);
```

#### 2. **Rate Limiting** (`backend/routes/authRoutes.js`)

**Login Rate Limiter:**
```javascript
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 5,                     // Max 5 requests
  skipSuccessfulRequests: true // Chỉ đếm khi login THẤT BẠI
});
```

**Forgot Password Rate Limiter:**
```javascript
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: 3                      // Max 3 requests
});
```

**Response khi bị rate limit:**
```json
{
  "success": false,
  "message": "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút."
}
```

---

### SV3: Database - ActivityLog Model ✅

**Schema** (`backend/models/ActivityLog.js`):
```javascript
{
  userId: ObjectId,          // Ref to User (nullable)
  email: String,             // Cho trường hợp không có userId
  action: String,            // Enum: LOGIN, LOGOUT, etc.
  ipAddress: String,
  userAgent: String,
  details: Mixed,            // Object chứa thông tin chi tiết
  status: String,            // SUCCESS | FAILED | WARNING
  timestamp: Date            // Thời gian
}
```

**Indexes:**
- `userId` + `timestamp` (compound)
- `action` + `timestamp`
- `status` + `timestamp`

**Static Methods:**
```javascript
ActivityLog.getRecentLogs(limit, skip, filter)
ActivityLog.getUserLogs(userId, limit)
ActivityLog.countFailedLogins(email, minutes)
ActivityLog.cleanupOldLogs(daysToKeep)
```

---

### SV2: Frontend - Admin UI ✅

**Vị trí:** `frontend/src/pages/Admin.jsx`

**Features:**

#### 1. **Activity Logs Tab**
- ✅ Tab riêng "Activity Logs" trong Admin Dashboard
- ✅ Hiển thị bảng logs với đầy đủ thông tin:
  - Timestamp (format Vietnam)
  - User (username + email)
  - Action (với color coding)
  - Status (SUCCESS/FAILED badge)
  - IP Address
  - Details (JSON preview)

#### 2. **Filters**
- ✅ Filter by Action type (dropdown)
- ✅ Filter by Status (SUCCESS/FAILED/WARNING)
- ✅ Pagination với `<Pagination>` component
- ✅ Refresh button để reload logs

#### 3. **Statistics Dashboard**
- ✅ **Total Activities** card (7 ngày gần nhất)
- ✅ **Failed Logins** card (màu đỏ - security alert)
- ✅ **Successful Actions** card (màu xanh)
- ✅ **Active Users** card (top users hoạt động nhiều)

#### 4. **Service Layer**
**File:** `frontend/src/services/activityService.js`
```javascript
getActivityLogs(params)      // Get logs với filter + pagination
getUserActivityLogs(userId)  // Logs của 1 user
getActivityStats(days)       // Thống kê
cleanupOldLogs(days)         // Cleanup (admin only)
```

---

## 🔧 Backend API Endpoints

### Activity Logs Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/activity/logs` | Admin | Lấy danh sách logs với pagination |
| `GET` | `/api/activity/logs/user/:userId` | Admin | Logs của một user |
| `GET` | `/api/activity/stats` | Admin | Thống kê activities |
| `DELETE` | `/api/activity/logs/cleanup` | Admin | Xóa logs cũ |

### Query Parameters (GET `/api/activity/logs`)

```
?page=1              // Trang hiện tại
&limit=20            // Số logs mỗi trang
&action=LOGIN        // Filter theo action
&status=FAILED       // Filter theo status
&userId=abc123       // Filter theo user
&startDate=2024-01-01  // Filter từ ngày
&endDate=2024-12-31    // Filter đến ngày
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "userId": {
          "username": "john_doe",
          "email": "john@example.com",
          "role": "user"
        },
        "action": "LOGIN",
        "status": "SUCCESS",
        "ipAddress": "192.168.1.100",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2024-10-30T10:30:00.000Z",
        "details": {
          "email": "john@example.com",
          "remember": false
        }
      }
    ],
    "pagination": {
      "total": 1250,
      "page": 1,
      "limit": 20,
      "totalPages": 63
    }
  }
}
```

---

## 📈 Activity Stats API

**Endpoint:** `GET /api/activity/stats?days=7`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "Last 7 days",
    "actionStats": [
      { "_id": "LOGIN", "count": 450 },
      { "_id": "PROFILE_UPDATE", "count": 120 },
      { "_id": "LOGIN_FAILED", "count": 35 }
    ],
    "statusStats": [
      { "_id": "SUCCESS", "count": 1180 },
      { "_id": "FAILED", "count": 50 }
    ],
    "dailyStats": [
      { "_id": "2024-10-24", "count": 180 },
      { "_id": "2024-10-25", "count": 195 }
    ],
    "topUsers": [
      {
        "userId": "...",
        "username": "john_doe",
        "email": "john@example.com",
        "count": 85
      }
    ],
    "failedLogins": 35
  }
}
```

---

## 🧪 Testing Guide

### 1. Test Rate Limiting với Postman

#### Bước 1: Import Collection
- Import file `Activity_Logging_API.postman_collection.json`

#### Bước 2: Test Login Rate Limit
1. Chọn request **"Login (Test Rate Limit)"**
2. Body chứa email/password **SAI**
3. Click **"Send"** 5 lần liên tiếp
4. Lần thứ 6 sẽ nhận được response:
   ```json
   {
     "success": false,
     "message": "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút."
   }
   ```
5. HTTP Status: **429 Too Many Requests**

#### Bước 3: Verify Logs
1. Login với tài khoản admin
2. Gọi `GET /api/activity/logs?action=LOGIN_FAILED`
3. Xem danh sách 5 lần login failed vừa test

---

### 2. Test Activity Logging

#### Test 1: Login tạo log
```bash
POST http://localhost:4000/api/auth/login
{
  "email": "admin@test.com",
  "password": "admin123"
}

# Kiểm tra log trong DB:
GET /api/activity/logs?action=LOGIN&limit=1
```

#### Test 2: Profile Update tạo log
```bash
PUT http://localhost:4000/api/users/profile
Authorization: Bearer <access_token>
{
  "name": "New Name"
}

# Kiểm tra:
GET /api/activity/logs?action=PROFILE_UPDATE
```

#### Test 3: Failed Login tạo log
```bash
POST http://localhost:4000/api/auth/login
{
  "email": "admin@test.com",
  "password": "wrong_password"
}

# Kiểm tra:
GET /api/activity/logs?action=LOGIN_FAILED
```

---

### 3. Test Frontend UI

#### Bước 1: Khởi động Frontend & Backend
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend/frontend
npm start
```

#### Bước 2: Login với Admin
- URL: http://localhost:3000/login (hoặc port frontend của bạn)
- Email: `admin@test.com`
- Password: `admin123`

#### Bước 3: Truy cập Admin Dashboard
- Navigate to: `/admin`
- Click tab **"Activity Logs"**

#### Bước 4: Test Filters
- Chọn Action = "LOGIN" → Xem tất cả login events
- Chọn Status = "FAILED" → Xem failed attempts
- Chọn Action = "LOGIN_FAILED" + Status = "FAILED" → Xem brute force attempts

#### Bước 5: Test Pagination
- Scroll xuống dưới bảng
- Click số trang để xem các logs cũ hơn

#### Bước 6: Verify Statistics
- Kiểm tra 4 cards ở trên cùng:
  - Total Activities (tổng số actions)
  - Failed Logins (màu đỏ - số lần login failed)
  - Successful Actions (màu xanh)
  - Active Users (số user hoạt động)

---

## 🔐 Security Features

### 1. **Brute Force Protection**
- ✅ Login giới hạn 5 lần failed / 15 phút
- ✅ Forgot Password giới hạn 3 lần / 1 giờ
- ✅ Rate limit theo IP address
- ✅ Log tất cả failed attempts

### 2. **Activity Monitoring**
- ✅ Track tất cả actions quan trọng
- ✅ Lưu IP address + User Agent
- ✅ Timestamp chính xác
- ✅ Details theo từng action type

### 3. **Admin Oversight**
- ✅ Admin xem được tất cả logs
- ✅ Filter theo user, action, status
- ✅ Statistics dashboard cho security monitoring
- ✅ Detect suspicious patterns (nhiều failed logins)

---

## 📊 Database Statistics

### Cleanup Old Logs
```javascript
// Xóa logs cũ hơn 90 ngày (tiết kiệm storage)
DELETE /api/activity/logs/cleanup
{
  "days": 90
}
```

### Count Failed Logins
```javascript
// Model method
ActivityLog.countFailedLogins('user@email.com', 15);
// Returns: số lần login failed trong 15 phút gần nhất
```

---

## 🎨 Frontend UI Components

### Color Coding

**Action Colors:**
- 🟢 **Green** (success): LOGIN, REGISTER
- 🔴 **Red** (error): LOGIN_FAILED, USER_DELETED
- 🟠 **Orange** (warning): ROLE_CHANGED, PASSWORD_CHANGED
- 🔵 **Blue** (info): VIEW_USERS, VIEW_LOGS

**Status Badges:**
- ✅ **SUCCESS** → Green outline chip
- ❌ **FAILED** → Red outline chip
- ⚠️ **WARNING** → Orange outline chip

---

## 📸 Screenshots cho Báo cáo

### Screenshots cần chụp:

1. **Rate Limiting Test**
   - Postman: Request "Login (Test Rate Limit)"
   - Response 429: "Quá nhiều lần đăng nhập thất bại..."
   - Headers: `RateLimit-Limit`, `RateLimit-Remaining`

2. **Activity Logs API**
   - Postman: GET `/api/activity/logs` response
   - Show pagination data
   - Show logs array với populated userId

3. **Activity Stats API**
   - Postman: GET `/api/activity/stats` response
   - Show actionStats, statusStats, topUsers

4. **Frontend Admin - Activity Logs Tab**
   - Tab "Activity Logs" được chọn
   - Bảng logs với đầy đủ columns
   - Statistics cards ở trên

5. **Frontend - Filters hoạt động**
   - Dropdown Action = "LOGIN_FAILED"
   - Bảng chỉ hiển thị failed logins
   - Status badges màu đỏ

6. **Frontend - Pagination**
   - Pagination component ở dưới bảng
   - Show "Page 2 of 10" hoặc tương tự

7. **MongoDB Compass / Database**
   - Collection `activitylogs`
   - Document với đầy đủ fields
   - Show indexes

---

## ⚙️ Configuration

### Environment Variables

Không cần thêm biến môi trường mới. Rate limiting hoạt động với config mặc định.

### Customize Rate Limits

**File:** `backend/routes/authRoutes.js`

```javascript
// Thay đổi giới hạn login
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // Thay đổi time window
  max: 5,                    // Thay đổi số requests
  skipSuccessfulRequests: true
});

// Thay đổi giới hạn forgot password
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: 3                     // Max 3 requests
});
```

---

## 🐛 Troubleshooting

### ❌ Error: "Cannot read property 'user' of undefined"
**Nguyên nhân:** `logActivity` middleware được gọi trước `protect` middleware

**Giải pháp:**
```javascript
// ❌ SAI
router.put('/profile', logActivity('PROFILE_UPDATE'), protect, updateProfile);

// ✅ ĐÚNG
router.put('/profile', protect, logActivity('PROFILE_UPDATE'), updateProfile);
```

### ❌ Logs không xuất hiện trong DB
**Kiểm tra:**
1. ✅ MongoDB đã kết nối?
2. ✅ Model `ActivityLog` đã import trong middleware?
3. ✅ Console có log error không?

**Debug:**
```javascript
// Thêm vào logActivity middleware
console.log('Creating log:', logData);
await ActivityLog.create(logData);
console.log('Log created successfully');
```

### ❌ Rate limit không hoạt động
**Nguyên nhân:** `skipSuccessfulRequests: true` bị thiếu

**Giải pháp:** Đảm bảo config đầy đủ:
```javascript
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true  // Quan trọng!
});
```

### ❌ Frontend không load được logs
**Kiểm tra:**
1. ✅ Backend route `/api/activity` đã register trong `server.js`?
2. ✅ User đã login với role `admin`?
3. ✅ `activityService.js` import đúng trong `Admin.jsx`?

---

## ✅ Checklist Hoàn thành

### Backend (SV1 + SV3)
- [x] Model `ActivityLog` với đầy đủ fields
- [x] Indexes cho performance
- [x] Middleware `logActivity`
- [x] Rate limiter cho `/login`
- [x] Rate limiter cho `/forgot-password`
- [x] Controller: `getActivityLogs`, `getUserActivityLogs`, `getActivityStats`
- [x] Routes: `/api/activity/logs`, `/api/activity/stats`
- [x] Integrate logging vào tất cả routes quan trọng
- [x] Log failed logins riêng biệt

### Frontend (SV2)
- [x] Service `activityService.js`
- [x] Admin.jsx: Tab "Activity Logs"
- [x] Bảng hiển thị logs với pagination
- [x] Filters (Action, Status)
- [x] Statistics cards (4 cards)
- [x] Color coding cho actions/statuses
- [x] Refresh button
- [x] Format timestamp Vietnam

### Testing
- [x] Postman collection
- [x] Test rate limiting (5 failed → 429)
- [x] Test logs được tạo cho mọi action
- [x] Test filters hoạt động
- [x] Test pagination
- [x] Test statistics API

### Documentation
- [x] README_ACTIVITY_LOGGING.md (file này)
- [x] Postman collection với tests
- [x] Code comments đầy đủ
- [x] API documentation

---

## 🚀 Deployment Notes

### Production Considerations

1. **Log Retention:**
   - Setup cron job để cleanup logs cũ:
     ```javascript
     // Weekly cleanup (giữ 90 ngày)
     cron.schedule('0 0 * * 0', async () => {
       await ActivityLog.cleanupOldLogs(90);
     });
     ```

2. **Performance:**
   - Indexes đã được tạo sẵn
   - Pagination giới hạn 50 logs/page max
   - Aggregate queries cho stats đã optimize

3. **Security:**
   - Rate limit production nên nghiêm ngặt hơn
   - Consider IP whitelist cho admin
   - Monitor failed login patterns

4. **Storage:**
   - Logs có thể tốn nhiều storage
   - Regular cleanup cần thiết
   - Consider archiving logs cũ sang storage riêng

---

## 📚 References

- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [MongoDB Indexing Best Practices](https://www.mongodb.com/docs/manual/indexes/)
- [OWASP Brute Force Attack Prevention](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)

---

**Developed by:** Group 15 - RMIT University  
**Date:** October 30, 2024  
**Version:** 1.0.0
