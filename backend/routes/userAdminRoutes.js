const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const { getUsers, deleteUser } = require('../controllers/adminController');

// /api/users (Admin)
router.get('/', protect, requireRole('admin'), getUsers);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;
