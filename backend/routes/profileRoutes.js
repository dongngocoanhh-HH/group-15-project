// backend/routes/profileRoutes.js
const express = require('express');
const router = express.Router();

// Đường dẫn chính xác tới middleware (folder name: 'middleware')
const authMiddleware = require('../middleware/authMiddleware');
const profileController = require('../controllers/profileController');

// GET /api/profile    -> xem profile
router.get('/', authMiddleware, profileController.getProfile);

// PUT /api/profile    -> cập nhật profile
router.put('/', authMiddleware, profileController.updateProfile);

module.exports = router;
