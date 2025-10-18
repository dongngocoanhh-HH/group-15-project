const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /users - lấy danh sách người dùng
router.get('/', userController.getUsers);

// POST /users - tạo user mới
router.post('/', userController.createUser);

module.exports = router;
