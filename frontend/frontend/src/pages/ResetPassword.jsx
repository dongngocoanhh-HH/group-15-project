// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy token từ URL query params (nếu user click link trong email)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      console.log('✅ Token loaded from URL:', tokenFromUrl);
    }
  }, [location]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError(false);

    if (!token || !pwd) {
      setError(true);
      setMsg('Thiếu token hoặc mật khẩu mới');
      return;
    }
    if (pwd !== pwd2) {
      setError(true);
      setMsg('Mật khẩu nhập lại không khớp');
      return;
    }

    setLoading(true);
    const res = await resetPassword({ token, password: pwd });
    setLoading(false);

    if (!res.success) {
      setError(true);
      setMsg(res.message || 'Đổi mật khẩu thất bại');
      return;
    }

    setMsg(res.message || 'Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...');
    setError(false);
    
    // Tự động redirect về login sau 2 giây
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2} fontWeight={700}>
          🔐 Đổi mật khẩu
        </Typography>

        {msg && (
          <Alert severity={error ? 'error' : 'success'} sx={{ mb: 2 }}>
            {msg}
          </Alert>
        )}

        <Box component="form" onSubmit={submit}>
          <TextField
            label="Token reset *"
            fullWidth
            margin="normal"
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            helperText={token ? '✅ Token đã được load từ email' : 'Copy token từ email hoặc click link trong email'}
          />
          <TextField
            label="Mật khẩu mới *"
            type="password"
            fullWidth
            margin="normal"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            helperText="Tối thiểu 6 ký tự"
          />
          <TextField
            label="Nhập lại mật khẩu mới *"
            type="password"
            fullWidth
            margin="normal"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
            error={pwd2 && pwd !== pwd2}
            helperText={pwd2 && pwd !== pwd2 ? '❌ Mật khẩu không khớp' : ''}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mt: 2 }}
            fullWidth
          >
            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
          
          <Button
            variant="text"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate('/login')}
          >
            Quay lại đăng nhập
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
