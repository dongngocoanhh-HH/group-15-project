// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import { getProfile } from './services/userService';
import { getAccessToken, getUser, logout } from './services/authService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [token, setToken] = useState(getAccessToken());

  // Effect 1: Load user khi component mount hoặc location thay đổi
  useEffect(() => {
    // Load user info from localStorage first
    const cachedUser = getUser();
    const currentToken = getAccessToken();
    
    setToken(currentToken);
    
    if (cachedUser && currentToken) {
      setMe(cachedUser);
    } else {
      setMe(null);
    }

    // Nếu có token, load lại profile từ server
    if (currentToken) {
      let ignore = false;
      async function loadMe() {
        try {
          const res = await getProfile(currentToken);
          if (!ignore) setMe(res?.user || null);
        } catch {
          if (!ignore) setMe(null);
        }
      }
      loadMe();
      return () => { ignore = true; };
    }
  }, [location]); // Re-run khi location thay đổi (sau login/logout)

  // Effect 2: Listen for storage changes (multi-tab support)
  useEffect(() => {
    const handleStorageChange = () => {
      setToken(getAccessToken());
      setMe(getUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => { 
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    // Reset state TRƯỚC KHI navigate
    setToken(null);
    setMe(null);
    // Dùng navigate thay vì window.location.href để giữ React state
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* GIỮ NGUYÊN THANH NAV CŨ + THÊM 2 NÚT: QUÊN MẬT KHẨU, ĐỔI MẬT KHẨU */}
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1, fontWeight: 700 }}>Group 15 Project</Box>

          {!token && (
            <>
              <Button color="inherit" component={Link} to="/signup">Đăng ký</Button>
              <Button color="inherit" component={Link} to="/login">Đăng nhập</Button>
            </>
          )}

          {token && (
            <>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
              <Button color="inherit" component={Link} to="/forgot-password">Quên mật khẩu</Button>
              <Button color="inherit" component={Link} to="/reset-password">Đổi mật khẩu</Button>

              {me?.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">Admin</Button>
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
        <Route path="/profile" element={token ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={me?.role === 'admin' ? <Admin /> : <Navigate to="/login" replace />}
        />
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
