// frontend/src/services/userService.js
import { getAccessToken } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

async function readJson(res) {
  const text = await res.text();
  try { return JSON.parse(text || '{}'); } catch { return {}; }
}

/** PROFILE */
export async function getProfile(token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, user: data.user || data.data || data };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function updateProfile(payload, token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return {
      success: true,
      message: data?.message || 'Cập nhật thành công',
      user: data.user || data.data || data,
    };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/** ADMIN */
export async function adminGetUsers(token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    const users = Array.isArray(data) ? data : (data.users || []);
    return { success: true, users };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function adminDeleteUser(userId, token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, message: data?.message || 'Đã xóa user' };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/** UPLOAD AVATAR */
export async function uploadAvatar(file, token = getAccessToken()) {
  try {
    const form = new FormData();
    // field name phải là 'file' – khớp BE
    form.append('file', file);

    const res = await fetch(`${API_URL}/api/users/upload-avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,               // KHÔNG set 'Content-Type' thủ công
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Upload thất bại' };
    return { success: true, url: data.url, user: data.user, message: data.message || 'Upload thành công' };
  } catch (e) {
    console.error('uploadAvatar error:', e);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
