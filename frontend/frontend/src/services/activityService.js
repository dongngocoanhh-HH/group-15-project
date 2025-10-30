import { apiGet, apiDelete, parseJsonResponse } from '../utils/apiClient';

/**
 * Activity Service - Fetch activity logs
 */

/**
 * Lấy danh sách activity logs với phân trang và filter
 * @param {Object} params - Query parameters
 * @returns {Promise}
 */
export const getActivityLogs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.action) queryParams.append('action', params.action);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const response = await apiGet(`/api/activity/logs?${queryParams.toString()}`);
    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    throw error;
  }
};

/**
 * Lấy logs của một user cụ thể
 * @param {string} userId - User ID
 * @param {number} limit - Số lượng logs
 * @returns {Promise}
 */
export const getUserActivityLogs = async (userId, limit = 50) => {
  try {
    const response = await apiGet(`/api/activity/logs/user/${userId}?limit=${limit}`);
    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    throw error;
  }
};

/**
 * Lấy thống kê activities
 * @param {number} days - Số ngày cần lấy thống kê
 * @returns {Promise}
 */
export const getActivityStats = async (days = 7) => {
  try {
    const response = await apiGet(`/api/activity/stats?days=${days}`);
    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    throw error;
  }
};

/**
 * Xóa logs cũ (cleanup)
 * @param {number} days - Xóa logs cũ hơn bao nhiêu ngày
 * @returns {Promise}
 */
export const cleanupOldLogs = async (days = 90) => {
  try {
    const response = await apiDelete('/api/activity/logs/cleanup', {
      body: JSON.stringify({ days }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return await parseJsonResponse(response);
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    throw error;
  }
};
