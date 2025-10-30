import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    try {
      const resultAction = await dispatch(loginUser({ email, password })).unwrap();
      
      setSuccessMsg('Đăng nhập thành công!');
      
      // Navigate based on user role
      if (resultAction.user && resultAction.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      // Error is handled by Redux state
      console.error('Login failed:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" mb={2} textAlign="center">Đăng nhập</Typography>
      
      <TextField 
        label="Email" 
        type="email" 
        fullWidth 
        required 
        margin="normal" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      
      <TextField 
        label="Mật khẩu" 
        type="password" 
        fullWidth 
        required 
        margin="normal" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      
      <Button 
        variant="contained" 
        type="submit" 
        fullWidth 
        sx={{ mt: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
      </Button>
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}
    </Box>
  );
}
