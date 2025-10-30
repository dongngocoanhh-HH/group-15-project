const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const sharp = require('sharp');

// GET current user profile
exports.getProfile = async (req, res) => {
  try {
    // req.user được set bởi middleware protect
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    res.json({ 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('getProfile error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// PUT update current user profile
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }

    const { name, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    res.json({ 
      success: true, 
      message: 'Cập nhật thành công',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

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

// ADMIN: GET all users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    const mapped = users.map(u => ({ 
      id: u._id.toString(), 
      name: u.name, 
      email: u.email, 
      role: u.role,
      avatar: u.avatar
    }));
    res.json({ success: true, users: mapped });
  } catch (err) {
    console.error('listUsers error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// UPLOAD AVATAR to Cloudinary với Sharp resize
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file được upload' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)' 
      });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        message: 'File quá lớn. Tối đa 5MB' 
      });
    }

    // Resize image using Sharp before uploading to Cloudinary
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload to Cloudinary using resized buffer
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'avatars',
        resource_type: 'image',
        public_id: `user_${req.user._id}_${Date.now()}`,
        // Cloudinary transformations as backup
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Upload lên Cloudinary thất bại: ' + error.message 
          });
        }

        try {
          // Update user avatar URL
          const user = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: result.secure_url },
            { new: true }
          );

          if (!user) {
            return res.status(404).json({ success: false, message: 'User không tồn tại' });
          }

          res.json({ 
            success: true, 
            message: 'Upload avatar thành công',
            avatarUrl: result.secure_url,
            cloudinaryId: result.public_id,
            user: {
              id: user._id,
              email: user.email,
              name: user.name,
              role: user.role,
              avatar: user.avatar
            }
          });
        } catch (dbError) {
          console.error('Database update error:', dbError);
          res.status(500).json({ 
            success: false, 
            message: 'Lỗi cập nhật database: ' + dbError.message 
          });
        }
      }
    );

    // Pipe the resized buffer to Cloudinary
    const bufferStream = require('stream').Readable.from(resizedImageBuffer);
    bufferStream.pipe(uploadStream);

  } catch (err) {
    console.error('uploadAvatar error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ============ RBAC APIs ============

// ADMIN: Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, permissions } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Role không hợp lệ. Chỉ chấp nhận: user, moderator, admin' 
      });
    }

    const updates = { role };
    
    // Nếu role là moderator, có thể set permissions
    if (role === 'moderator' && permissions) {
      const validPermissions = ['manage_users', 'manage_posts', 'view_reports', 'delete_content'];
      const invalidPerms = permissions.filter(p => !validPermissions.includes(p));
      
      if (invalidPerms.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Permissions không hợp lệ: ${invalidPerms.join(', ')}` 
        });
      }
      
      updates.permissions = permissions;
    } else if (role !== 'moderator') {
      // Nếu không phải moderator, xóa permissions
      updates.permissions = [];
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    res.json({ 
      success: true, 
      message: 'Cập nhật role thành công',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('updateUserRole error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ADMIN: Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User không tồn tại' });
    }

    // Không cho phép vô hiệu hóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể thay đổi trạng thái của chính bạn' 
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      success: true, 
      message: `Đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error('toggleUserStatus error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// ADMIN/MODERATOR: Get user statistics by role
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({ 
      success: true, 
      stats: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: stats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error('getUserStats error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};

// MODERATOR: Get users with filters (with permission check)
exports.getManagedUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const mapped = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions || [],
      avatar: u.avatar,
      isActive: u.isActive,
      lastLogin: u.lastLogin,
      createdAt: u.createdAt
    }));

    res.json({ success: true, users: mapped });
  } catch (err) {
    console.error('getManagedUsers error:', err);
    res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
  }
};
