# 🚀 Quick Start: Test Rate Limiting

## ⚡ Hướng dẫn test Rate Limit trong 5 phút

---

## Bước 1️⃣: Start Backend Server

```bash
cd C:\Users\OANH\Downloads\group-15-project\group-15-project\backend
npm run dev
```

**Đợi thấy:**
```
✅ MongoDB connected
✅ Server running on http://localhost:4000
```

---

## Bước 2️⃣: Import Postman Collection

1. Mở **Postman**
2. Click **Import** (góc trên bên trái)
3. Click **Choose Files**
4. Chọn file: `Activity_Logging_API.postman_collection.json`
   - Đường dẫn: `C:\Users\OANH\Downloads\group-15-project\group-15-project\`
5. Click **Import**

✅ Sẽ thấy collection **"Activity Logging & Rate Limiting API"** xuất hiện

---

## Bước 3️⃣: Test Rate Limit - Login (5 lần trong 15 phút)

### A. Test Failed Login (6 lần)

1. Mở folder **"Authentication"** trong Postman
2. Click request **"Login (Test Rate Limit)"**

3. Xem Body (đã có sẵn):
   ```json
   {
     "email": "wrong@email.com",
     "password": "wrongpassword"
   }
   ```

4. **Click Send 6 lần liên tiếp**

### Kết quả mong đợi:

**Lần 1-5:** ✅ Status `400 Bad Request`
```json
{
  "success": false,
  "message": "Email hoặc mật khẩu không đúng"
}
```

**Lần 6:** ⚠️ Status `429 Too Many Requests` (BỊ CHẶN!)
```json
{
  "success": false,
  "message": "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút."
}
```

### 📸 Screenshot cần chụp:
- ✅ Response lần thứ 6 với status `429`
- ✅ Message "Quá nhiều lần đăng nhập thất bại..."
- ✅ Tab **Headers** có:
  - `RateLimit-Limit: 5`
  - `RateLimit-Remaining: 0`
  - `RateLimit-Reset: <timestamp>`

---

## Bước 4️⃣: Verify Logs trong Database

### A. Login với Admin account

1. Click request **"Login Success (Creates Log)"**
2. Body đã có:
   ```json
   {
     "email": "admin@test.com",
     "password": "admin123"
   }
   ```
3. Click **Send**

4. **Copy accessToken** từ response:
   ```json
   {
     "success": true,
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": { ... }
   }
   ```

### B. Get Failed Login Logs

1. Mở folder **"Activity Logs"**
2. Click request **"Get Failed Login Attempts"**
3. Tab **Headers** → Thay `{{accessToken}}` bằng token vừa copy:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Click **Send**

### Kết quả mong đợi:

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "_id": "...",
        "userId": null,
        "email": "wrong@email.com",
        "action": "LOGIN_FAILED",
        "status": "FAILED",
        "ipAddress": "::1",
        "timestamp": "2024-10-30T10:30:00.000Z",
        "details": {
          "email": "wrong@email.com",
          "reason": "Invalid credentials"
        }
      }
      // ... 4 logs nữa (tổng 5 lần failed)
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 50
    }
  }
}
```

### 📸 Screenshot cần chụp:
- ✅ Response có array logs với 5 items
- ✅ Mỗi log có `action: "LOGIN_FAILED"` và `status: "FAILED"`
- ✅ Có `email: "wrong@email.com"` và `ipAddress`

---

## Bước 5️⃣: Test Frontend Admin UI

### A. Start Frontend

```bash
cd C:\Users\OANH\Downloads\group-15-project\group-15-project\frontend\frontend
npm start
```

Đợi compile xong, browser tự mở: http://localhost:3000

### B. Login Admin

1. URL: http://localhost:3000/login
2. Nhập:
   - Email: `admin@test.com`
   - Password: `admin123`
3. Click **Đăng nhập**

### C. Xem Activity Logs

1. Navigate to: http://localhost:3000/admin
2. Click tab **"Activity Logs"** (tab thứ 2)

3. **Test Statistics Cards** (4 cards ở trên):
   - Total Activities
   - Failed Logins (màu đỏ) → Sẽ thấy **5** hoặc nhiều hơn
   - Successful Actions
   - Active Users

4. **Test Filters:**
   - Dropdown **Action** → Chọn "LOGIN_FAILED"
   - Dropdown **Status** → Chọn "FAILED"
   - Click ngoài để apply filter

5. **Xem bảng logs:**
   - Sẽ hiển thị các dòng với:
     - Time: Thời gian (format Vietnam)
     - User: "wrong@email.com" (màu xám - anonymous)
     - Action: Chip màu đỏ "LOGIN_FAILED"
     - Status: Chip outline đỏ "FAILED"
     - IP Address: `::1` hoặc IP của bạn
     - Details: JSON preview

### 📸 Screenshots cần chụp:

1. **Statistics Cards:**
   - Chụp 4 cards với số liệu
   - Card "Failed Logins" (màu đỏ) phải có số > 0

2. **Activity Logs Table:**
   - Tab "Activity Logs" được chọn
   - Filter = "LOGIN_FAILED"
   - Bảng hiển thị ít nhất 5 dòng
   - Có pagination ở dưới

3. **Chi tiết một log:**
   - Zoom vào 1 dòng trong bảng
   - Show rõ: Time, User, Action chip, Status chip, IP

---

## Bước 6️⃣: Test Forgot Password Rate Limit (Bonus)

### A. Test trong Postman

1. Click request **"Password Reset Request (Test Rate Limit)"** (nếu có)
2. Body:
   ```json
   {
     "email": "test@email.com"
   }
   ```
3. Click **Send 4 lần** liên tiếp

**Kết quả:**
- Lần 1-3: Status `200` (hoặc `400` nếu email không tồn tại)
- Lần 4: Status `429` → "Quá nhiều yêu cầu reset password. Vui lòng thử lại sau 1 giờ."

---

## 🎯 Checklist Test Hoàn Thành

### Postman Tests:
- [ ] ✅ Login failed 5 lần → Status 400
- [ ] ✅ Login lần 6 → Status 429 "Quá nhiều lần..."
- [ ] ✅ Headers có `RateLimit-Limit: 5`, `RateLimit-Remaining: 0`
- [ ] ✅ GET /api/activity/logs → Trả về 5 logs LOGIN_FAILED
- [ ] ✅ Response có pagination info

### Frontend Tests:
- [ ] ✅ Admin login thành công
- [ ] ✅ Tab "Activity Logs" hiển thị
- [ ] ✅ 4 Statistics cards có số liệu
- [ ] ✅ Failed Logins card (đỏ) = 5 hoặc hơn
- [ ] ✅ Filter "LOGIN_FAILED" hoạt động
- [ ] ✅ Bảng hiển thị logs với đầy đủ columns
- [ ] ✅ Pagination component hiển thị

### Screenshots:
- [ ] 📸 Postman: Response 429 với headers
- [ ] 📸 Postman: GET logs response
- [ ] 📸 Frontend: Activity Logs tab
- [ ] 📸 Frontend: Statistics cards
- [ ] 📸 Frontend: Filtered table

---

## 🐛 Troubleshooting

### ❌ Postman: "Could not get response"
**Giải pháp:** Kiểm tra backend có chạy không
```bash
cd backend
npm run dev
```

### ❌ Postman: Status 401 "Không có token"
**Nguyên nhân:** Chưa login admin hoặc token hết hạn  
**Giải pháp:** 
1. Gọi lại "Login Success"
2. Copy accessToken mới
3. Paste vào Headers của request

### ❌ Frontend: "Cannot read property 'logs'"
**Nguyên nhân:** Backend chưa chạy hoặc API error  
**Giải pháp:**
1. Check backend console có lỗi không
2. F12 → Console xem error
3. Refresh page

### ❌ Rate limit không hoạt động
**Nguyên nhân:** Redis hoặc memory store issue  
**Giải pháp:** Restart backend server

### ❌ Logs không hiển thị trong bảng
**Kiểm tra:**
1. ✅ Backend route `/api/activity` đã register?
2. ✅ MongoDB có collection `activitylogs`?
3. ✅ User đã login với role `admin`?
4. ✅ Browser console có error?

---

## 📚 Tài liệu tham khảo

- **Chi tiết API:** `README_ACTIVITY_LOGGING.md`
- **Postman Collection:** `Activity_Logging_API.postman_collection.json`
- **Code Implementation:** 
  - Backend: `backend/middleware/logActivity.js`
  - Frontend: `frontend/src/pages/Admin.jsx`

---

## 🎓 Nộp báo cáo

### Screenshots cần nộp:

1. **Postman_RateLimit_429.png**
   - Request thứ 6 bị chặn
   - Status 429
   - Message "Quá nhiều lần..."
   - Headers tab

2. **Postman_FailedLogs_API.png**
   - GET /api/activity/logs response
   - Array có 5 logs
   - Status "FAILED"

3. **Frontend_ActivityLogs_Tab.png**
   - Tab "Activity Logs" 
   - Statistics cards
   - Bảng logs

4. **Frontend_Filtered_Table.png**
   - Filter = LOGIN_FAILED
   - Bảng chỉ show failed logins
   - Pagination

5. **MongoDB_Logs_Collection.png** (Optional)
   - MongoDB Compass
   - Collection `activitylogs`
   - Documents với LOGIN_FAILED

---

**Chúc bạn test thành công! 🚀**

Nếu gặp lỗi, check lại từng bước hoặc hỏi giảng viên/bạn cùng nhóm!
