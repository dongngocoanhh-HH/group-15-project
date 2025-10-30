# GROUP-15-PROJECT

## Mô tả
Ứng dụng quản lý User (CRUD) với Authentication, RBAC, Avatar Upload, và Forgot Password — Frontend sử dụng React, Backend sử dụng Node.js + Express, Database MongoDB.

Ứng dụng cho phép:
- ✅ Authentication (JWT + Refresh Token)
- ✅ RBAC: User/Moderator/Admin roles với permissions
- ✅ Avatar Upload (Multer + Sharp + Cloudinary)
- ✅ Forgot Password với Email thật (Nodemailer + Gmail SMTP)
- ✅ CRUD operations cho User management
- ✅ Profile management

## Công nghệ
- Frontend: React, Material-UI, Axios, React Router
- Backend: Node.js, Express, Mongoose, JWT, Bcrypt, Multer, Sharp, Nodemailer
- Database: MongoDB
- Cloud: Cloudinary (image storage)
- Email: Gmail SMTP
- Công cụ: Git, GitHub, Postman, VSCode

## Yêu cầu
- Node.js >= 14
- npm
- MongoDB connection URI (MongoDB Atlas hoặc local)
- Gmail account với App Password (cho email feature)
- Cloudinary account (cho avatar upload)

## 📚 Documentation

- **[README_FORGOT_PASSWORD.md](README_FORGOT_PASSWORD.md)** - Forgot Password feature overview
- **[TESTING_FORGOT_PASSWORD.md](TESTING_FORGOT_PASSWORD.md)** - Hướng dẫn setup Gmail và testing
- **[IMPLEMENTATION_SUMMARY_FORGOT_PASSWORD.md](IMPLEMENTATION_SUMMARY_FORGOT_PASSWORD.md)** - Implementation summary
- **[README_AVATAR.md](README_AVATAR.md)** - Avatar upload documentation
- **[TESTING_AVATAR.md](TESTING_AVATAR.md)** - Avatar testing guide

## Cài đặt & chạy

### Backend
# MONGO_URI=mongodb+srv://123:12345@cluster0.mo3fa3y.mongodb.net/groupDB?retryWrites=true&w=majority&appName=Cluster0
# PORT=3000
```bash
cd backend
npm install

# Create .env file from template
copy .env.example .env

# Update .env with your credentials:
# - MongoDB URI
# - JWT secrets
# - Cloudinary credentials
# - Gmail SMTP credentials (EMAIL_USER, EMAIL_PASSWORD)

# Test email configuration (optional)
node testEmail.js

# Start backend server
npm start    # or npm run dev
