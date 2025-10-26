const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', { expiresIn: '7d' });
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
    }

    const existed = await User.findOne({ email });
    if (existed) return res.status(400).json({ success: false, message: 'Email đã tồn tại' });

    const user = new User({ email, password, name: name || '' }); // pre('save') sẽ hash
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, message: 'Đăng ký thành công', token });
  } catch (e) {
    console.error('signup error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Thiếu email hoặc mật khẩu' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });

    const token = signToken(user._id);
    res.json({ success: true, message: 'Đăng nhập thành công', token });
  } catch (e) {
    console.error('login error:', e);
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
      return res.json({ success: true, message: 'Nếu email tồn tại, đã gửi hướng dẫn đặt lại.' });
    }

    const plainToken = crypto.randomBytes(20).toString('hex');
    const hashed = crypto.createHash('sha256').update(plainToken).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await user.save();

    // Demo: trả token trong response thay vì gửi email
    res.json({ success: true, message: 'Token reset đã tạo', token: plainToken });
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

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });

    user.password = password; // pre('save') sẽ hash
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công. Hãy đăng nhập lại.' });
  } catch (e) {
    console.error('resetPassword error:', e);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
