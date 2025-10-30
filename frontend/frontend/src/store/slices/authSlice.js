import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginAPI, signup as signupAPI } from '../../services/authService';

/**
 * Auth Slice - Quản lý state authentication với Redux
 */

// Async thunk: Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // FIX: loginAPI nhận object { email, password }, không phải 2 params riêng
      const response = await loginAPI({ email, password });
      
      if (response.success) {
        // Lưu tokens vào localStorage (sẽ được persist tự động)
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        return {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        };
      } else {
        return rejectWithValue(response.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi kết nối server');
    }
  }
);

// Async thunk: Signup
export const signupUser = createAsyncThunk(
  'auth/signup',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      // FIX: signupAPI nhận object { email, password, name }
      const response = await signupAPI({ email, password, name });
      
      if (response.success) {
        // Lưu tokens
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        return {
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        };
      } else {
        return rejectWithValue(response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Lỗi kết nối server');
    }
  }
);

// Logout action (synchronous)
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return null;
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous action: Set user from localStorage on app load
    setUserFromStorage: (state) => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (token && user) {
        state.user = user;
        state.accessToken = token;
        state.refreshToken = localStorage.getItem('refreshToken');
        state.isAuthenticated = true;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update tokens (for refresh token flow)
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        // Lưu user info vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
      });
    
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      });
  }
});

export const { setUserFromStorage, clearError, updateTokens } = authSlice.actions;
export default authSlice.reducer;
