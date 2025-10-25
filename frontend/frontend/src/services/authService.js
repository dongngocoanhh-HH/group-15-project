// frontend/src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

// --- Auth ---
export async function signup({ email, password }) {
  try {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, token: data.token, message: data.message || 'Đăng ký thành công' };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function login({ email, password }) {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, token: data.token, message: data.message || 'Đăng nhập thành công' };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

// --- Forgot/Reset password ---
export async function forgotPassword(email) {
  try {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    // backend của bạn trả {token} trong body; ở thực tế sẽ là email.
    return { success: true, token: data.token, message: data.message || 'Đã tạo token reset' };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function resetPassword({ token, password }) {
  try {
    // Gửi cả 2 key 'password' và 'newPassword' để tương thích mọi backend
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password, newPassword: password }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, message: data.message || 'Đổi mật khẩu thành công' };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
