// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
  uploadAvatar,
} = require('../controllers/userController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// USER
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// ADMIN
router.get('/', protect, requireRole('admin'), listUsers);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

// UPLOAD AVATAR  (field name = 'file')
router.post('/upload-avatar', protect, upload.single('file'), uploadAvatar);

module.exports = router;
