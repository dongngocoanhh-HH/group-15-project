// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Moderator from './pages/Moderator';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

import { logoutUser } from './store/slices/authSlice';
import { getProfile } from './services/userService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth);

  // Effect: Refresh user profile from server when token exists
  useEffect(() => {
    if (accessToken && isAuthenticated) {
      let ignore = false;
      async function loadMe() {
        try {
          await getProfile(accessToken);
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      }
      loadMe();
      return () => { ignore = true; };
    }
  }, [location, accessToken, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* GIỮ NGUYÊN THANH NAV CŨ + THÊM 2 NÚT: QUÊN MẬT KHẨU, ĐỔI MẬT KHẨU */}
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1, fontWeight: 700 }}>Group 15 Project</Box>

          {!isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/signup">Đăng ký</Button>
              <Button color="inherit" component={Link} to="/login">Đăng nhập</Button>
            </>
          )}

          {isAuthenticated && (
            <>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" component={Link} to="/forgot-password">Quên mật khẩu</Button>
              <Button color="inherit" component={Link} to="/reset-password">Đổi mật khẩu</Button>

              {/* Admin-only button */}
              {user?.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">👑 Admin</Button>
              )}
              
              {/* Moderator button */}
              {(user?.role === 'moderator' || user?.role === 'admin') && (
                <Button color="inherit" component={Link} to="/moderator">🛡️ Moderator</Button>
              )}
              
              <Button color="inherit" onClick={handleLogout}>Đăng xuất</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/moderator" 
          element={
            <ProtectedRoute allowedRoles={['moderator', 'admin']}>
              <Moderator />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
