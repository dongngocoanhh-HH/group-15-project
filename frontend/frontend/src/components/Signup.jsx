import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { signup, getUser } from '../services/authService';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(false);
    const res = await signup({ email, password, name });
    if (res.success && res.accessToken && res.refreshToken) {
      // Token đã được lưu tự động trong authService
      setMsg('Đăng ký thành công!');
      setErr(false);
      
      // Lấy thông tin user để check role
      const user = getUser();
      
      // Chuyển hướng sau 500ms
      setTimeout(() => {
        // Nếu là admin thì redirect đến /admin, không thì /profile
        if (user && user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }, 500);
    } else {
      setErr(true);
      setMsg(res.message || 'Đăng ký thất bại');
    }
  };

  return (
    <Box component="form" onSubmit={handleSignup} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" mb={2} textAlign="center">Đăng ký</Typography>
      <TextField label="Tên" type="text" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Mật khẩu" type="password" fullWidth required margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>Đăng ký</Button>
      {msg && <Alert severity={err ? 'error' : 'success'} sx={{ mt: 2 }}>{msg}</Alert>}
    </Box>
  );
}
