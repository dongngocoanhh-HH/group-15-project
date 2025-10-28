// frontend/src/services/authService.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

// === Token Management ===
// Lưu tokens vào localStorage
export function saveTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
}

// Lấy access token
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// Lấy refresh token
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

// Xóa tất cả tokens
export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token'); // Clear old token if exists
}

// Lưu thông tin user
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Lấy thông tin user
export function getUser() {
  const user = localStorage.getItem('user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Kiểm tra đã đăng nhập chưa
export function isAuthenticated() {
  return !!getAccessToken();
}

// --- Auth API ---
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
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    if (data.user) saveUser(data.user);
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      message: data.message || 'Đăng ký thành công' 
    };
  } catch (err) {
    console.error('Signup error:', err);
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
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    if (data.user) saveUser(data.user);
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      message: data.message || 'Đăng nhập thành công' 
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

// Refresh Access Token
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
      // Refresh token hết hạn hoặc không hợp lệ -> logout
      clearTokens();
      return { success: false, message: data?.message || 'Phiên đăng nhập đã hết hạn' };
    }
    
    // Lưu tokens mới
    saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    
    return { 
      success: true, 
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      message: 'Làm mới token thành công' 
    };
  } catch (err) {
    console.error('Refresh token error:', err);
    clearTokens();
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

// Logout
export async function logout(logoutAll = false) {
  try {
    const refreshToken = getRefreshToken();
    
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, logoutAll }),
    });
    
    // Xóa tokens dù API có thành công hay không
    clearTokens();
    localStorage.removeItem('user');
    
    const data = await readJson(res);
    return { 
      success: true, 
      message: data?.message || 'Đăng xuất thành công' 
    };
  } catch (err) {
    console.error('Logout error:', err);
    // Vẫn xóa tokens local
    clearTokens();
    localStorage.removeItem('user');
    return { success: true, message: 'Đã đăng xuất' };
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
