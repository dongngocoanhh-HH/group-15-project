const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendResetPasswordEmail, sendPasswordChangedEmail } = require('../config/emailService');
const { logFailedLogin } = require('../middleware/logActivity');

// Tạo Access Token (short-lived: 15 phút)
function signAccessToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', { 
    expiresIn: '15m' // 15 phút
  });
}

// Tạo Refresh Token (long-lived: 7 ngày)
function signRefreshToken(id) {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key', { 
    expiresIn: '7d' // 7 ngày
  });
}

// Lưu Refresh Token vào database
async function saveRefreshToken(userId, token, req) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày

  const refreshToken = new RefreshToken({
    token,
    userId,
    expiresAt,
    deviceInfo: {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress
    }
  });

  await refreshToken.save();
  return refreshToken;
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existed = await User.findOne({ email });
    if (existed) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    // Tạo user mới - pre('save') hook sẽ tự động hash password
    const user = new User({ 
      email, 
      password, 
      name: name || '',
      role: 'user' // Mặc định là user, có thể đổi thành 'admin' nếu cần
    });
    await user.save();

    // Tạo cả Access Token và Refresh Token
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    
    // Lưu Refresh Token vào DB
    await saveRefreshToken(user._id, refreshToken, req);

    res.json({ 
      success: true, 
      message: 'Đăng ký thành công', 
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (e) {
    console.error('signup error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + e.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
    }

    // Phải select password để so sánh
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Log failed login attempt
      await logFailedLogin(email, req);
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Sử dụng method comparePassword từ model
    const match = await user.comparePassword(password);
    if (!match) {
      // Log failed login attempt
      await logFailedLogin(email, req);
      return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo cả Access Token và Refresh Token
    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    
    // Lưu Refresh Token vào DB
    await saveRefreshToken(user._id, refreshToken, req);

    res.json({ 
      success: true, 
      message: 'Đăng nhập thành công', 
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + e.message });
  }
};

// POST /api/auth/refresh - Refresh Access Token
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Thiếu refresh token' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token không hợp lệ' });
    }

    // Kiểm tra token có trong DB và còn hợp lệ không
    const storedToken = await RefreshToken.findOne({ 
      token: refreshToken,
      userId: decoded.id 
    });

    if (!storedToken || !storedToken.isValid()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token đã hết hạn hoặc bị thu hồi' 
      });
    }

    // Kiểm tra user còn tồn tại
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User không tồn tại' });
    }

    // Tạo Access Token mới
    const newAccessToken = signAccessToken(user._id);

    res.json({
      success: true,
      message: 'Refresh token thành công',
      accessToken: newAccessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (e) {
    console.error('refresh error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/logout - Thu hồi token
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Thiếu refresh token' });
    }

    // Revoke refresh token
    const result = await RefreshToken.updateOne(
      { token: refreshToken },
      { isRevoked: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Token không tìm thấy' });
    }

    res.json({ success: true, message: 'Đăng xuất thành công' });
  } catch (e) {
    console.error('logout error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/logout-all - Thu hồi tất cả token của user
exports.logoutAll = async (req, res) => {
  try {
    // req.user được set bởi middleware protect
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    await RefreshToken.revokeAllUserTokens(req.user._id);

    res.json({ success: true, message: 'Đã đăng xuất khỏi tất cả thiết bị' });
  } catch (e) {
    console.error('logoutAll error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/forgot-password { email }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, message: 'Thiếu email' });

    const user = await User.findOne({ email });
    if (!user) {
      // Trả về success để tránh attacker biết email có tồn tại hay không
      return res.json({ success: true, message: 'Nếu email tồn tại, đã gửi hướng dẫn đặt lại mật khẩu.' });
    }

    // Tạo token ngẫu nhiên
    const plainToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Lưu token đã hash và thời gian hết hạn (10 phút)
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Gửi email reset password
    try {
      await sendResetPasswordEmail(user.email, plainToken, user.name || user.email);
      console.log('✅ Reset password email sent to:', user.email);
      
      res.json({ 
        success: true, 
        message: 'Email hướng dẫn đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.' 
      });
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      
      // Xóa token vì không gửi được email
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      
      return res.status(500).json({ 
        success: false, 
        message: 'Không thể gửi email. Vui lòng thử lại sau hoặc kiểm tra cấu hình email.' 
      });
    }
  } catch (e) {
    console.error('forgotPassword error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/reset-password { token, password }
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu token hoặc mật khẩu mới' });
    }

    // Hash token để so sánh với DB
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu reset lại.' 
      });
    }

    // Cập nhật mật khẩu mới (pre('save') sẽ hash tự động)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Gửi email xác nhận đổi password thành công (optional)
    try {
      await sendPasswordChangedEmail(user.email, user.name || user.email);
      console.log('✅ Password changed notification sent to:', user.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError);
      // Không trả lỗi vì password đã đổi thành công
    }

    res.json({ 
      success: true, 
      message: 'Đổi mật khẩu thành công. Hãy đăng nhập lại với mật khẩu mới.' 
    });
  } catch (e) {
    console.error('resetPassword error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
