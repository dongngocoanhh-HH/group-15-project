const User = require('../models/User');

// GET all
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    // chuyển _id -> id để frontend không phải thay đổi nhiều
    const mapped = users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST create
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    const saved = await user.save();
    res.status(201).json({ id: saved._id.toString(), name: saved.name, email: saved.email });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) { // duplicate key error
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT update
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const updated = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json({ id: updated._id.toString(), name: updated.name, email: updated.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
