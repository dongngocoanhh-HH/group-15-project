const User = require('../models/User');

// GET /api/users  (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// DELETE /api/users/:id  (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    // Admin không tự xóa chính mình (tránh kẹt)
    if (id === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Không thể tự xóa chính mình' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User không tồn tại' });

    await user.deleteOne();
    res.json({ success: true, message: 'Xóa user thành công' });
  } catch (err) {
    console.error('deleteUser error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
