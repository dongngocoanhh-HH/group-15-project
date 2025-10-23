# GROUP-15-PROJECT

## Mô tả
Ứng dụng quản lý User (CRUD) — Frontend sử dụng React, Backend sử dụng Node.js + Express, Database MongoDB.

Ứng dụng cho phép:
- Tạo (POST) người dùng
- Đọc (GET) danh sách/chi tiết
- Cập nhật (PUT) người dùng
- Xóa (DELETE) người dùng

## Công nghệ
- Frontend: React, Axios, CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas (hoặc local MongoDB)
- Công cụ: Git, GitHub, Postman, VSCode

## Yêu cầu
- Node.js >= 14
- npm
- MongoDB connection URI (MongoDB Atlas hoặc local)

## Cài đặt & chạy

### Backend
# MONGO_URI=mongodb+srv://123:12345@cluster0.mo3fa3y.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0
# PORT=3000
```bash
cd backend
npm install
# MONGO_URI=mongodb+srv://123:12345@cluster0.mo3fa3y.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0
# PORT=3000
npm run dev    # hoặc npm start (cho frontend)
