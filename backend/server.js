require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/myapp';

// Thực hiện kết nối MongoDB rồi start server trong callback .then
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');

    // gắn routes API
    app.use('/', userRoutes);

    // route root để test nhanh
    app.get('/', (req, res) => {
      res.send('🚀 User API is running. Try GET /users');
    });

    // start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
