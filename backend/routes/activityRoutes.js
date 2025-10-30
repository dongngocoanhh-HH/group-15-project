const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/logActivity');
const {
  getActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  cleanupOldLogs
} = require('../controllers/activityController');

/**
 * @route   GET /api/activity/logs
 * @desc    Lấy danh sách activity logs
 * @access  Private/Admin
 */
router.get('/logs', protect, requireRole('admin'), logActivity('VIEW_LOGS'), getActivityLogs);

/**
 * @route   GET /api/activity/logs/user/:userId
 * @desc    Lấy logs của một user cụ thể
 * @access  Private/Admin
 */
router.get('/logs/user/:userId', protect, requireRole('admin'), getUserActivityLogs);

/**
 * @route   GET /api/activity/stats
 * @desc    Lấy thống kê activities
 * @access  Private/Admin
 */
router.get('/stats', protect, requireRole('admin'), getActivityStats);

/**
 * @route   DELETE /api/activity/logs/cleanup
 * @desc    Xóa logs cũ (cleanup)
 * @access  Private/Admin
 */
router.delete('/logs/cleanup', protect, requireRole('admin'), cleanupOldLogs);

module.exports = router;
