const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  // thêm trường khác nếu cần, ví dụ: age, role...
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
