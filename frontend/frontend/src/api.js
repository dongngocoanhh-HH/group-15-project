import axios from 'axios';
import { getAccessToken, refreshAccessToken, clearTokens } from './services/authService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Tự động thêm Access Token vào header
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Tự động refresh token khi Access Token hết hạn
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry, thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Kiểm tra xem có phải lỗi TOKEN_EXPIRED không
      const errorCode = error.response?.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          // Nếu đang refresh, thêm request vào queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const result = await refreshAccessToken();
          
          if (result.success && result.accessToken) {
            // Refresh thành công, retry các request đang chờ
            processQueue(null, result.accessToken);
            originalRequest.headers.Authorization = `Bearer ${result.accessToken}`;
            return api(originalRequest);
          } else {
            // Refresh thất bại, logout user
            processQueue(new Error('Phiên đăng nhập đã hết hạn'), null);
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const createUserForm = (formData) => api.post('/api/users', formData);

// Protected API calls with automatic token refresh
export const getProfile = () => api.get('/api/profile');
export const updateProfile = (data) => api.put('/api/profile', data);
