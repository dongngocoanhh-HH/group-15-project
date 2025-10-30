const ActivityLog = require('../models/ActivityLog');

/**
 * Middleware: Ghi log hoạt động người dùng
 * @param {string} action - Loại hành động (LOGIN, LOGOUT, etc.)
 * @param {object} options - Tùy chọn bổ sung
 * @returns {Function} Express middleware
 */
const logActivity = (action, options = {}) => {
  return async (req, res, next) => {
    // Lưu reference đến res.json gốc
    const originalJson = res.json.bind(res);

    // Override res.json để bắt response
    res.json = function(data) {
      // Log activity sau khi response được gửi
      setImmediate(async () => {
        try {
          const logData = {
            userId: req.user?._id || req.user?.id || null,
            email: req.body?.email || req.user?.email || null,
            action: action,
            ipAddress: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'],
            userAgent: req.headers['user-agent'],
            timestamp: new Date(),
            details: {},
            status: 'SUCCESS'
          };

          // Xác định status dựa trên response
          if (data && typeof data === 'object') {
            if (data.success === false || res.statusCode >= 400) {
              logData.status = 'FAILED';
            }
          }

          // Thêm details tùy theo action
          switch (action) {
            case 'LOGIN':
            case 'LOGIN_FAILED':
              logData.details = {
                email: req.body?.email,
                remember: req.body?.remember || false
              };
              break;

            case 'REGISTER':
              logData.details = {
                username: req.body?.username,
                email: req.body?.email,
                role: req.body?.role || 'user'
              };
              break;

            case 'PASSWORD_RESET_REQUEST':
              logData.details = {
                email: req.body?.email
              };
              break;

            case 'PASSWORD_RESET_SUCCESS':
            case 'PASSWORD_CHANGED':
              logData.details = {
                userId: req.user?._id
              };
              break;

            case 'PROFILE_UPDATE':
              logData.details = {
                updatedFields: Object.keys(req.body || {})
              };
              break;

            case 'AVATAR_UPLOAD':
              logData.details = {
                fileName: req.file?.originalname,
                fileSize: req.file?.size
              };
              break;

            case 'USER_CREATED':
            case 'USER_UPDATED':
              logData.details = {
                targetUserId: req.body?._id || req.params?.id,
                targetEmail: req.body?.email
              };
              break;

            case 'USER_DELETED':
              logData.details = {
                targetUserId: req.params?.id
              };
              break;

            case 'ROLE_CHANGED':
              logData.details = {
                targetUserId: req.params?.id || req.body?.userId,
                newRole: req.body?.role
              };
              break;

            case 'VIEW_USERS':
              logData.details = {
                filters: req.query
              };
              break;

            case 'VIEW_LOGS':
              logData.details = {
                page: req.query?.page,
                limit: req.query?.limit
              };
              break;

            default:
              logData.details = options.details || {};
          }

          // Tạo log trong database
          await ActivityLog.create(logData);
        } catch (error) {
          // Không throw error để không ảnh hưởng đến response
          console.error('❌ Error logging activity:', error);
        }
      });

      // Gọi res.json gốc
      return originalJson(data);
    };

    next();
  };
};

/**
 * Helper: Log activity trực tiếp (không qua middleware)
 * Dùng cho các trường hợp đặc biệt
 */
const logActivityDirect = async (userId, action, details = {}, req = null) => {
  try {
    const logData = {
      userId: userId || null,
      action: action,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      timestamp: new Date(),
      details: details,
      status: 'SUCCESS'
    };

    await ActivityLog.create(logData);
    return { success: true };
  } catch (error) {
    console.error('❌ Error logging activity directly:', error);
    return { success: false, error };
  }
};

/**
 * Middleware: Log failed login attempts
 * Dùng riêng cho login failures
 */
const logFailedLogin = async (email, req) => {
  try {
    await ActivityLog.create({
      userId: null,
      email: email,
      action: 'LOGIN_FAILED',
      ipAddress: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
      details: {
        email: email,
        reason: 'Invalid credentials'
      },
      status: 'FAILED'
    });
  } catch (error) {
    console.error('❌ Error logging failed login:', error);
  }
};

module.exports = {
  logActivity,
  logActivityDirect,
  logFailedLogin
};
