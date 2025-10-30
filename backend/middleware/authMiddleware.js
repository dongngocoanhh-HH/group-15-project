const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Lấy token từ Header: Authorization: Bearer xxx
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Hoặc từ cookie (nếu bạn đang dùng cookie)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Không có token',
        code: 'NO_TOKEN'
      });
    }

    // Verify Access Token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    } catch (err) {
      // Kiểm tra loại lỗi
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token đã hết hạn',
          code: 'TOKEN_EXPIRED'
        });
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token không hợp lệ',
          code: 'INVALID_TOKEN'
        });
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Xác thực thất bại',
          code: 'AUTH_FAILED'
        });
      }
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User không tồn tại',
        code: 'USER_NOT_FOUND'
      });
    }

    req.user = user; // gắn user vào req
    next();
  } catch (err) {
    console.error('protect error:', err.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Xác thực thất bại',
      code: 'AUTH_ERROR'
    });
  }
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Chưa đăng nhập',
        code: 'NOT_AUTHENTICATED'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Không đủ quyền',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};

// Middleware kiểm tra permission cho moderator
exports.checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Chưa đăng nhập',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    // Admin có tất cả quyền
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Moderator cần check permissions
    if (req.user.role === 'moderator') {
      const userPermissions = req.user.permissions || [];
      const hasPermission = permissions.some(perm => userPermissions.includes(perm));
      
      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: `Cần quyền: ${permissions.join(' hoặc ')}`,
          code: 'INSUFFICIENT_PERMISSION'
        });
      }
      return next();
    }
    
    // User thường không có quyền
    return res.status(403).json({ 
      success: false, 
      message: 'Không đủ quyền',
      code: 'FORBIDDEN'
    });
  };
};

// Middleware kết hợp: Admin hoặc Moderator
exports.isAdminOrModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Chưa đăng nhập',
      code: 'NOT_AUTHENTICATED'
    });
  }
  
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Chỉ Admin hoặc Moderator mới có quyền',
      code: 'FORBIDDEN'
    });
  }
  
  next();
};
