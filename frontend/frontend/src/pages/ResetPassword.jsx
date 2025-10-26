// frontend/src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';
import { resetPassword } from '../services/authService';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setMsg(res.message || 'Đổi mật khẩu thành công');
    setError(false);
    // Tuỳ bạn: tự động điều hướng về /login
    // setTimeout(() => (window.location.href = '/login'), 1200);
  };

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2} fontWeight={700}>
          Đổi mật khẩu bằng token
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
          />
          <TextField
            label="Mật khẩu mới *"
            type="password"
            fullWidth
            margin="normal"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <TextField
            label="Nhập lại mật khẩu mới *"
            type="password"
            fullWidth
            margin="normal"
            value={pwd2}
            onChange={(e) => setPwd2(e.target.value)}
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
        </Box>
      </Paper>
    </Box>
  );
}
