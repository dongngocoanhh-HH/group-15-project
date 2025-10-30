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
  // backend may return avatarUrl, url or user.avatar depending on implementation
  const avatarUrl = data.avatarUrl || data.url || (data.user && data.user.avatar) || null;
  return { success: true, url: avatarUrl, user: data.user, message: data.message || 'Upload thành công' };
  } catch (e) {
    console.error('uploadAvatar error:', e);
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

/** RBAC APIs */
export async function updateUserRole(userId, role, permissions = [], token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ role, permissions }),
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, message: data?.message || 'Cập nhật role thành công', user: data.user };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function toggleUserStatus(userId, token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, message: data?.message || 'Đã thay đổi trạng thái', user: data.user };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function getUserStats(token = getAccessToken()) {
  try {
    const res = await fetch(`${API_URL}/api/users/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, stats: data.stats };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}

export async function getManagedUsers(filters = {}, token = getAccessToken()) {
  try {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.search) params.append('search', filters.search);

    const url = `${API_URL}/api/users/managed${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    });
    const data = await readJson(res);
    if (!res.ok) return { success: false, message: data?.message || 'Lỗi server' };
    return { success: true, users: data.users || [] };
  } catch {
    return { success: false, message: 'Lỗi kết nối server' };
  }
}
