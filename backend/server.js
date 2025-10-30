require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myapp';

// Thực hiện kết nối MongoDB rồi start server trong callback .then
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // gắn routes API
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/activity', activityRoutes);

    // route root để test nhanh
    app.get('/', (req, res) => {
      res.send('🚀 User API is running. Try GET /users or POST /api/auth/login');
    });

    // start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
