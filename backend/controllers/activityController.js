const ActivityLog = require('../models/ActivityLog');

/**
 * @desc    Lấy danh sách activity logs (Admin only)
 * @route   GET /api/activity/logs
 * @access  Private/Admin
 */
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};

    if (action) {
      filter.action = action;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Get logs with population
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'username email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await ActivityLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách logs',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy logs của một user cụ thể
 * @route   GET /api/activity/logs/user/:userId
 * @access  Private/Admin
 */
const getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await ActivityLog.getUserLogs(userId, parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('❌ Error getting user activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy logs của user',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy thống kê activities
 * @route   GET /api/activity/stats
 * @access  Private/Admin
 */
const getActivityStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    // Thống kê theo action
    const actionStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: cutoffDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Thống kê theo status
    const statusStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: cutoffDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Thống kê theo ngày
    const dailyStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: cutoffDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top users hoạt động nhiều nhất
    const topUsers = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: cutoffDate }, userId: { $ne: null } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          username: '$user.username',
          email: '$user.email',
          count: 1
        }
      }
    ]);

    // Đếm failed logins
    const failedLogins = await ActivityLog.countDocuments({
      action: 'LOGIN_FAILED',
      timestamp: { $gte: cutoffDate }
    });

    res.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        actionStats,
        statusStats,
        dailyStats,
        topUsers,
        failedLogins
      }
    });
  } catch (error) {
    console.error('❌ Error getting activity stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa logs cũ (cleanup)
 * @route   DELETE /api/activity/logs/cleanup
 * @access  Private/Admin
 */
const cleanupOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;

    const result = await ActivityLog.cleanupOldLogs(parseInt(days));

    res.json({
      success: true,
      message: `Đã xóa ${result.deletedCount} logs cũ hơn ${days} ngày`
    });
  } catch (error) {
    console.error('❌ Error cleaning up logs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa logs cũ',
      error: error.message
    });
  }
};

module.exports = {
  getActivityLogs,
  getUserActivityLogs,
  getActivityStats,
  cleanupOldLogs
};
