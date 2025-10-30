const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/authMiddleware');
const { logActivity } = require('../middleware/logActivity');

const {
  signup,
  login,
  refresh,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController'); // đường dẫn & tên export phải đúng

// Rate limiter cho login endpoint - chống brute force
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 requests mỗi windowMs
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Chỉ đếm khi login thất bại
  skipSuccessfulRequests: true
});

// Rate limiter cho forgot password - chống spam
const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 requests mỗi giờ
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu reset password. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/signup', logActivity('REGISTER'), signup);
router.post('/login', loginRateLimiter, logActivity('LOGIN'), login);
router.post('/refresh', refresh); // Refresh access token
router.post('/logout', logActivity('LOGOUT'), logout); // Logout single device
router.post('/logout-all', protect, logActivity('LOGOUT'), logoutAll); // Logout all devices (requires authentication)
router.post('/forgot-password', forgotPasswordRateLimiter, logActivity('PASSWORD_RESET_REQUEST'), forgotPassword);
router.post('/reset-password', logActivity('PASSWORD_RESET_SUCCESS'), resetPassword);

module.exports = router;
