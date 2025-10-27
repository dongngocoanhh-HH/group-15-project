// backend/controllers/profileController.js
const User = require('../models/User'); // sửa theo đường dẫn model của bạn

// GET profile
exports.getProfile = async (req, res) => {
  try {
    // authMiddleware phải gán req.userId hoặc tương tự
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// PUT update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, avatar, email, password } = req.body;
    const update = { name, avatar, email };

    // nếu có password, hash lại (nếu bạn dùng bcryptjs ở project thì import & hash)
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
    res.json({ success: true, user, message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
