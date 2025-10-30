const mongoose = require('mongoose');

/**
 * ActivityLog Schema
 * Ghi lại mọi hoạt động của người dùng trong hệ thống
 */
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Có thể null cho các hành động không cần auth (ví dụ: failed login)
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'LOGIN_FAILED',
      'PASSWORD_RESET_REQUEST',
      'PASSWORD_RESET_SUCCESS',
      'PASSWORD_CHANGED',
      'PROFILE_UPDATE',
      'AVATAR_UPLOAD',
      'USER_CREATED',
      'USER_UPDATED',
      'USER_DELETED',
      'ROLE_CHANGED',
      'VIEW_USERS',
      'VIEW_LOGS'
    ],
    index: true
  },
  email: {
    type: String,
    required: false, // Email của user (cho trường hợp userId null)
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Object chứa thông tin chi tiết
    required: false
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'WARNING'],
    default: 'SUCCESS'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true // Tự động thêm createdAt, updatedAt
});

// Index compound cho query phổ biến
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ status: 1, timestamp: -1 });

// Virtual field để lấy thông tin user
activityLogSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Đảm bảo virtuals được include khi convert sang JSON
activityLogSchema.set('toJSON', { virtuals: true });
activityLogSchema.set('toObject', { virtuals: true });

// Static method: Lấy logs với pagination
activityLogSchema.statics.getRecentLogs = function(limit = 100, skip = 0, filter = {}) {
  return this.find(filter)
    .populate('userId', 'username email role')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// Static method: Lấy logs của một user
activityLogSchema.statics.getUserLogs = function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method: Đếm số lần thử login failed trong khoảng thời gian
activityLogSchema.statics.countFailedLogins = function(email, minutes = 15) {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.countDocuments({
    email,
    action: 'LOGIN_FAILED',
    timestamp: { $gte: cutoffTime }
  });
};

// Static method: Xóa logs cũ (data cleanup)
activityLogSchema.statics.cleanupOldLogs = function(daysToKeep = 90) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
