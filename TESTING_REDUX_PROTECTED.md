# Testing Guide: Frontend Redux & Protected Routes

## Mục đích
Hướng dẫn kiểm tra chi tiết tính năng Redux Toolkit và Protected Routes (Hoạt động 6).

## Yêu cầu kiểm tra
- ✅ Redux store lưu trữ thông tin xác thực
- ✅ Redux persist giữ state sau khi refresh
- ✅ Protected Routes chặn truy cập khi chưa đăng nhập
- ✅ Role-based access control (User vs Admin)
- ✅ Redux thunks gọi API đúng cách
- ✅ Loading states và error handling

---

## Bước 0: Chuẩn bị

### 0.1. Đảm bảo đang ở đúng branch
```bash
git branch
# Phải thấy * feature/redux-protected
```

Nếu chưa đúng:
```bash
git checkout feature/redux-protected
```

### 0.2. Cài đặt Redux DevTools Extension
- Chrome: https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/

### 0.3. Kiểm tra database có users
Cần ít nhất 2 users: 1 user thường, 1 admin.

```bash
# Terminal 1: Vào backend
cd backend
node seedUsers.js
```

Kết quả mong đợi:
```
✓ User created: user@example.com (role: user)
✓ Admin created: admin@example.com (role: admin)
```

---

## Bước 1: Khởi động Backend và Frontend

### 1.1. Khởi động Backend
```bash
# Terminal 1
cd backend
npm run dev
```

Chờ thấy:
```
Server running on port 5000
MongoDB connected successfully
```

### 1.2. Khởi động Frontend
```bash
# Terminal 2
cd frontend/frontend
npm start
```

Chờ trình duyệt tự mở: http://localhost:3000

---

## Bước 2: Test Protected Routes - Chưa đăng nhập

### Test 2.1: Truy cập /profile khi chưa login
1. Mở trình duyệt: http://localhost:3000/profile
2. **Kết quả mong đợi:**
   - ❌ KHÔNG hiển thị trang Profile
   - ✅ Tự động redirect về `/login`
   - ✅ URL thay đổi thành: http://localhost:3000/login

### Test 2.2: Truy cập /admin khi chưa login
1. Nhập URL: http://localhost:3000/admin
2. **Kết quả mong đợi:**
   - ❌ KHÔNG hiển thị trang Admin
   - ✅ Redirect về `/login`

### Test 2.3: Truy cập /moderator khi chưa login
1. Nhập URL: http://localhost:3000/moderator
2. **Kết quả mong đợi:**
   - ❌ KHÔNG hiển thị trang Moderator
   - ✅ Redirect về `/login`

---

## Bước 3: Test Redux Login Flow

### Test 3.1: Login với User thường
1. Mở Redux DevTools (F12 → Redux tab)
2. Chọn State → Kiểm tra `auth` object:
   ```json
   {
     "user": null,
     "accessToken": null,
     "loading": false,
     "error": null
   }
   ```

3. Đăng nhập:
   - Email: `user@example.com`
   - Password: `password123`
   - Click **Login**

4. **Kết quả mong đợi:**
   - ✅ Redux DevTools → Action: `auth/loginUser/pending`
   - ✅ Action: `auth/loginUser/fulfilled`
   - ✅ State thay đổi:
     ```json
     {
       "user": {
         "email": "user@example.com",
         "name": "Regular User",
         "role": "user"
       },
       "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "loading": false,
       "error": null
     }
     ```
   - ✅ Redirect về `/profile`

### Test 3.2: Kiểm tra Redux Persist
1. **Đang ở trang Profile**, bấm F5 refresh trang
2. **Kết quả mong đợi:**
   - ✅ Vẫn ở trang `/profile` (KHÔNG redirect về login)
   - ✅ Redux DevTools vẫn giữ `user` và `accessToken`
   - ✅ Hiển thị đúng thông tin user

### Test 3.3: User thường KHÔNG truy cập được /admin
1. Nhập URL: http://localhost:3000/admin
2. **Kết quả mong đợi:**
   - ❌ KHÔNG hiển thị trang Admin
   - ✅ Redirect về `/` (Home page)
   - ✅ Console log: "Access denied: insufficient permissions"

### Test 3.4: Logout
1. Click nút **Logout** ở header
2. **Kết quả mong đợi:**
   - ✅ Redux DevTools → Action: `auth/logoutUser/fulfilled`
   - ✅ State reset:
     ```json
     {
       "user": null,
       "accessToken": null,
       "loading": false,
       "error": null
     }
     ```
   - ✅ Redirect về `/login`

3. Thử truy cập `/profile` lại → Phải redirect về `/login`

---

## Bước 4: Test Admin Role Access

### Test 4.1: Login với Admin
1. Đăng nhập:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Click **Login**

2. **Kết quả mong đợi:**
   - ✅ Redux state có `user.role = "admin"`
   - ✅ Redirect về `/profile`

### Test 4.2: Admin truy cập /admin thành công
1. Nhập URL: http://localhost:3000/admin
2. **Kết quả mong đợi:**
   - ✅ Hiển thị trang Admin Dashboard
   - ✅ Thấy 2 tabs: "Manage Users" và "Activity Logs"

### Test 4.3: Admin truy cập /moderator thành công
1. Nhập URL: http://localhost:3000/moderator
2. **Kết quả mong đợi:**
   - ✅ Hiển thị trang Moderator
   - ✅ Vì admin có quyền cao hơn moderator

---

## Bước 5: Test Error Handling

### Test 5.1: Login với thông tin sai
1. Logout trước (nếu đang login)
2. Đăng nhập:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
   - Click **Login**

3. **Kết quả mong đợi:**
   - ✅ Redux DevTools → Action: `auth/loginUser/rejected`
   - ✅ State có error:
     ```json
     {
       "user": null,
       "accessToken": null,
       "loading": false,
       "error": "Invalid credentials"
     }
     ```
   - ✅ Hiển thị thông báo lỗi màu đỏ trên UI

### Test 5.2: Signup với email đã tồn tại
1. Vào trang Signup: http://localhost:3000/signup
2. Đăng ký:
   - Name: `Test User`
   - Email: `admin@example.com` (đã tồn tại)
   - Password: `password123`
   - Click **Sign Up**

3. **Kết quả mong đợi:**
   - ✅ Action: `auth/signupUser/rejected`
   - ✅ Hiển thị lỗi: "Email already exists"

---

## Bước 6: Test Loading States

### Test 6.1: Kiểm tra loading indicator
1. Mở Network tab (F12 → Network)
2. Throttle network: "Slow 3G"
3. Login với `user@example.com`

4. **Kết quả mong đợi:**
   - ✅ Redux state: `loading = true` khi đang gọi API
   - ✅ Button Login disable hoặc hiển thị spinner
   - ✅ Redux state: `loading = false` sau khi nhận response

---

## Bước 7: Test Local Storage Persistence

### Test 7.1: Kiểm tra localStorage
1. Login với `admin@example.com`
2. Mở DevTools → Application → Local Storage → http://localhost:3000
3. **Kết quả mong đợi:**
   - ✅ Thấy key: `persist:root`
   - ✅ Value chứa:
     ```json
     {
       "auth": "{\"user\":{...},\"accessToken\":\"...\",\"loading\":false,\"error\":null}",
       "_persist": "{\"version\":-1,\"rehydrated\":true}"
     }
     ```

### Test 7.2: Xóa localStorage và refresh
1. Xóa key `persist:root`
2. Refresh trang (F5)
3. **Kết quả mong đợi:**
   - ✅ Redux state reset về null
   - ✅ Redirect về `/login`

---

## Bước 8: Test Multiple Tabs

### Test 8.1: Redux persist đồng bộ giữa các tabs
1. Tab 1: Login với `admin@example.com`
2. Mở Tab 2: http://localhost:3000/admin
3. **Kết quả mong đợi:**
   - ✅ Tab 2 tự động có auth state
   - ✅ Tab 2 hiển thị Admin Dashboard (không cần login lại)

4. Tab 1: Click Logout
5. Tab 2: Refresh trang
6. **Kết quả mong đợi:**
   - ✅ Tab 2 redirect về `/login` (đã logout)

---

## Bước 9: Test Redux DevTools Time Travel

### Test 9.1: Undo/Redo actions
1. Login → Redux có 2 actions: `pending`, `fulfilled`
2. Redux DevTools → Slider ở dưới cùng
3. Kéo slider về trái (undo)
4. **Kết quả mong đợi:**
   - ✅ State quay về pending hoặc initial state
   - ✅ UI cập nhật theo state (có thể logout)

5. Kéo slider về phải (redo)
6. **Kết quả mong đợi:**
   - ✅ State quay về logged in
   - ✅ UI hiển thị user info

---

## Checklist Tổng Hợp

### Redux Toolkit
- [ ] Redux store được tạo với `configureStore`
- [ ] authSlice có async thunks: `loginUser`, `signupUser`, `logoutUser`
- [ ] Redux DevTools hiển thị actions và state changes
- [ ] Loading states (`pending`, `fulfilled`, `rejected`) hoạt động đúng

### Redux Persist
- [ ] State được lưu vào localStorage với key `persist:root`
- [ ] Refresh trang vẫn giữ auth state
- [ ] Logout xóa state đúng cách
- [ ] Multiple tabs đồng bộ state

### Protected Routes
- [ ] `/profile` chặn khi chưa login → redirect `/login`
- [ ] `/admin` chặn khi chưa login → redirect `/login`
- [ ] `/admin` chặn khi role = "user" → redirect `/`
- [ ] Admin truy cập được tất cả protected routes
- [ ] User chỉ truy cập được `/profile`

### API Integration
- [ ] Login gọi API `/api/auth/login` và lưu token
- [ ] Signup gọi API `/api/auth/register`
- [ ] Logout gọi API `/api/auth/logout`
- [ ] Error từ API hiển thị đúng trên UI

### UI/UX
- [ ] Loading indicator khi gọi API
- [ ] Error messages hiển thị rõ ràng
- [ ] Redirect mượt mà sau login/logout
- [ ] Không có console errors

---

## Screenshots cần chụp

### Screenshot 1: Redux DevTools - Initial State
- Chưa login
- State: `{ user: null, accessToken: null }`

### Screenshot 2: Redux DevTools - Login Actions
- Hiển thị: `auth/loginUser/pending` → `auth/loginUser/fulfilled`
- State sau login có `user` và `accessToken`

### Screenshot 3: Protected Route Redirect
- URL `/profile` khi chưa login
- Redirect về `/login`

### Screenshot 4: Role-based Access Denied
- User thường truy cập `/admin`
- Redirect về `/` (Home)

### Screenshot 5: Local Storage
- DevTools → Application → Local Storage
- Key `persist:root` với auth data

### Screenshot 6: Admin Dashboard
- Admin login thành công
- Hiển thị Admin page với Activity Logs

### Screenshot 7: Error Handling
- Login failed với thông tin sai
- Redux state có error message
- UI hiển thị error màu đỏ

### Screenshot 8: State Persistence
- Refresh trang sau khi login
- Vẫn giữ auth state
- Vẫn ở trang protected route

---

## Troubleshooting

### Vấn đề 1: Redux DevTools không hiển thị
**Giải pháp:**
- Cài extension Redux DevTools
- Kiểm tra `store/index.js` có `configureStore` (Redux Toolkit tự enable DevTools)

### Vấn đề 2: State không persist sau refresh
**Giải pháp:**
- Kiểm tra `index.js` có wrap `<PersistGate>`
- Xóa localStorage và thử lại
- Kiểm tra `persistConfig.whitelist = ['auth']`

### Vấn đề 3: Protected Route không redirect
**Giải pháp:**
- Kiểm tra `ProtectedRoute.jsx` có `<Navigate to="/login" />`
- Kiểm tra `App.js` có wrap routes với `<ProtectedRoute>`
- F12 → Console xem có lỗi routing không

### Vấn đề 4: API call failed
**Giải pháp:**
- Kiểm tra backend đang chạy: http://localhost:5000
- Kiểm tra `apiClient.js` có config đúng baseURL
- F12 → Network tab xem request details

### Vấn đề 5: Role-based access không hoạt động
**Giải pháp:**
- Kiểm tra `user.role` trong Redux state
- Kiểm tra `ProtectedRoute` prop `role="admin"`
- Kiểm tra backend trả về đúng role

---

## Kết luận

Sau khi hoàn thành tất cả tests:
1. ✅ Redux Toolkit quản lý auth state đúng cách
2. ✅ Redux Persist giữ state sau refresh
3. ✅ Protected Routes chặn unauthorized access
4. ✅ Role-based access control hoạt động (User vs Admin)
5. ✅ API integration qua Redux thunks
6. ✅ Error handling và loading states

**Next Steps:**
```bash
# Commit changes
git add .
git commit -m "Test Redux & Protected Routes - All tests passed"

# Push to remote
git push origin feature/redux-protected

# Create Pull Request on GitHub
```

**Báo cáo cần nộp:**
- 8 screenshots theo danh sách trên
- Link Pull Request
- Checklist đã hoàn thành
