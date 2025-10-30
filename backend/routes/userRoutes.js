// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole, checkPermission, isAdminOrModerator } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/logActivity');
const {
  getProfile,
  updateProfile,
  listUsers,
  deleteUser,
  uploadAvatar,
  updateUserRole,
  toggleUserStatus,
  getUserStats,
  getManagedUsers,
} = require('../controllers/userController');

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// USER
router.get('/profile', protect, getProfile);
router.put('/profile', protect, logActivity('PROFILE_UPDATE'), updateProfile);

// UPLOAD AVATAR  (field name = 'file')
router.post('/upload-avatar', protect, upload.single('file'), logActivity('AVATAR_UPLOAD'), uploadAvatar);

// ADMIN ONLY - User Management
router.get('/', protect, requireRole('admin'), logActivity('VIEW_USERS'), listUsers);
router.delete('/:id', protect, requireRole('admin'), logActivity('USER_DELETED'), deleteUser);

// RBAC - ADMIN ONLY
router.put('/:userId/role', protect, requireRole('admin'), logActivity('ROLE_CHANGED'), updateUserRole);
router.patch('/:userId/toggle-status', protect, requireRole('admin'), logActivity('USER_UPDATED'), toggleUserStatus);

// RBAC - ADMIN or MODERATOR
router.get('/stats', protect, isAdminOrModerator, getUserStats);
router.get('/managed', protect, checkPermission('manage_users'), getManagedUsers);

module.exports = router;
