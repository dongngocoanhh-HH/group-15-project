const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  // Thông tin thiết bị/trình duyệt để quản lý session
  deviceInfo: {
    userAgent: String,
    ipAddress: String
  },
  // Để revoke token khi logout
  isRevoked: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index để tự động xóa token đã hết hạn (TTL index)
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method để check token còn hợp lệ không
refreshTokenSchema.methods.isValid = function() {
  return !this.isRevoked && this.expiresAt > new Date();
};

// Static method để revoke tất cả token của user
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId) {
  return this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
};

// Static method để xóa token đã hết hạn
refreshTokenSchema.statics.removeExpiredTokens = async function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
