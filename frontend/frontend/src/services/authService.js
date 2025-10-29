// frontend/src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

// --- Token Management ---
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// --- Auth ---
export async function signup({ email, password, name }) {
  try {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    
    // Lưu tokens và user info
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      if (data.user) saveUser(data.user);
    }
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      message: data.message || 'Đăng ký thành công' 
    };
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
    
    // Lưu tokens và user info
    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      if (data.user) saveUser(data.user);
    }
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      message: data.message || 'Đăng nhập thành công' 
    };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

// --- Refresh Token ---
export async function refreshAccessToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return { success: false, message: 'Không có refresh token' };
    }

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await readJson(res);
    
    if (!res.ok) {
      // Refresh token hết hạn hoặc không hợp lệ
      clearTokens();
      return { success: false, message: data?.message || 'Refresh token không hợp lệ' };
    }
    
    // Lưu access token mới
    if (data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken);
      if (data.user) saveUser(data.user);
    }
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      user: data.user,
      message: 'Token đã được làm mới' 
    };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

// --- Logout ---
export async function logout() {
  try {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      // Gọi API để revoke token trên server
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
    
    // Xóa tokens từ localStorage
    clearTokens();
    return { success: true, message: 'Đăng xuất thành công' };
  } catch {
    // Vẫn xóa tokens dù API call thất bại
    clearTokens();
    return { success: true, message: 'Đăng xuất thành công' };
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
