const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, select: false }, // select: false để không trả về password mặc định
  role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
  // Permissions for moderator
  permissions: { 
    type: [String], 
    enum: ['manage_users', 'manage_posts', 'view_reports', 'delete_content'],
    default: []
  },
  // Các trường cho reset password
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
  // Avatar nếu cần
  avatar: { type: String },
  // Trạng thái tài khoản
  isActive: { type: Boolean, default: true },
  // Lần đăng nhập cuối
  lastLogin: { type: Date },
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  // Chỉ hash khi password được tạo mới hoặc thay đổi
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method để so sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
