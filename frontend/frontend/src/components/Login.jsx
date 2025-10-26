import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { login } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg(''); setErr(false);
    const res = await login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('token', res.token);
      setErr(false); setMsg('Đăng nhập thành công!');
      window.location.href = '/profile';
    } else {
      setErr(true);
      setMsg(res.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" mb={2} textAlign="center">Đăng nhập</Typography>
      <TextField label="Email" type="email" fullWidth required margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField label="Mật khẩu" type="password" fullWidth required margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" type="submit" fullWidth sx={{ mt: 2 }}>Đăng nhập</Button>
      {msg && <Alert severity={err ? 'error' : 'success'} sx={{ mt: 2 }}>{msg}</Alert>}
    </Box>
  );
}
