// frontend/src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box } from '@mui/material';

import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import { getProfile } from './services/userService';

export default function App() {
  const [me, setMe] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      try {
        if (!token) { setMe(null); return; }
        const res = await getProfile(token);
        if (!ignore) setMe(res?.user || null);
      } catch {
        if (!ignore) setMe(null);
      }
    }
    loadMe();
    return () => { ignore = true; };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
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
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={me?.role === 'admin' ? <Admin /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
