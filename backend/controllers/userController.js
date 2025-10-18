const User = require('../models/User');

// GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Thiếu name hoặc email' });
    }
    const user = new User({ name, email });
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error });
  }
};
