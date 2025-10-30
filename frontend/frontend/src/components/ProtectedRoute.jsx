import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

/**
 * Protected Route Component
 * Chặn truy cập nếu chưa đăng nhập
 * 
 * @param {object} props
 * @param {React.Component} props.children - Component cần protect
 * @param {string[]} props.allowedRoles - Danh sách roles được phép truy cập
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // Đang load state từ persist
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Chưa đăng nhập → Redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role (nếu có yêu cầu)
  if (allowedRoles.length > 0 && user) {
    if (!allowedRoles.includes(user.role)) {
      // Không đủ quyền → Redirect về home hoặc 403 page
      return <Navigate to="/" replace />;
    }
  }

  // Đã đăng nhập và đủ quyền → Render children
  return children;
};

export default ProtectedRoute;
