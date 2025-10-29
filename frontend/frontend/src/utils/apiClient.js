// frontend/src/utils/apiClient.js
import { getAccessToken, getRefreshToken, refreshAccessToken, clearTokens } from '../services/authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Flag để tránh refresh nhiều lần đồng thời
let isRefreshing = false;
let refreshSubscribers = [];

// Thêm request vào hàng đợi chờ token mới
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// Thực thi tất cả request đang chờ với token mới
function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

// Hàm helper để gọi API với auto-refresh
export async function apiClient(url, options = {}) {
  const accessToken = getAccessToken();
  
  // Thêm Authorization header nếu có token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_URL}${url}`, config);
    
    // Nếu token hết hạn (401) và có error code TOKEN_EXPIRED
    if (response.status === 401) {
      const data = await response.clone().json().catch(() => ({}));
      
      if (data.code === 'TOKEN_EXPIRED') {
        // Nếu đang refresh, chờ kết quả
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((newToken) => {
              // Retry request với token mới
              config.headers['Authorization'] = `Bearer ${newToken}`;
              resolve(fetch(`${API_URL}${url}`, config));
            });
          });
        }
        
        // Bắt đầu refresh
        isRefreshing = true;
        
        try {
          const refreshResult = await refreshAccessToken();
          
          if (refreshResult.success && refreshResult.accessToken) {
            isRefreshing = false;
            onRefreshed(refreshResult.accessToken);
            
            // Retry request với token mới
            config.headers['Authorization'] = `Bearer ${refreshResult.accessToken}`;
            return fetch(`${API_URL}${url}`, config);
          } else {
            // Refresh thất bại, redirect to login
            isRefreshing = false;
            clearTokens();
            window.location.href = '/login';
            throw new Error('Session expired. Please login again.');
          }
        } catch (error) {
          isRefreshing = false;
          clearTokens();
          window.location.href = '/login';
          throw error;
        }
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

// Helper methods cho các HTTP methods
export const apiGet = (url, options = {}) => {
  return apiClient(url, { ...options, method: 'GET' });
};

export const apiPost = (url, body, options = {}) => {
  return apiClient(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

export const apiPut = (url, body, options = {}) => {
  return apiClient(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

export const apiDelete = (url, options = {}) => {
  return apiClient(url, { ...options, method: 'DELETE' });
};

// Helper để parse JSON response
export async function parseJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text || '{}');
  } catch {
    return {};
  }
}
