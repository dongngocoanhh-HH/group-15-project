// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Alert } from '@mui/material';
import { forgotPassword } from '../services/authService'; // <-- đổi tên hàm ở đây

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const res = await forgotPassword(email); // <-- gọi đúng hàm export
    if (res.success) {
      setOk(true);
      setMessage(res.message || 'Đã gửi token reset. Kiểm tra console/email.');
      if (res.token) console.log('RESET TOKEN:', res.token);
    } else {
      setOk(false);
      setMessage(res.message || 'Không gửi được token');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6, p: 3 }}>
      <h2>Quên mật khẩu</h2>

      {message && (
        <Alert severity={ok ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button fullWidth type="submit" variant="contained">
          Gửi token reset
        </Button>
      </form>
    </Box>
  );
}
