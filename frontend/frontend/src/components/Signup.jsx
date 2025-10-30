import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { signupUser } from '../store/slices/authSlice';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    
    try {
      const resultAction = await dispatch(signupUser({ email, password, name })).unwrap();
      
      setSuccessMsg('Đăng ký thành công!');
      
      // Navigate based on user role after a short delay
      setTimeout(() => {
        if (resultAction.user && resultAction.user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/profile', { replace: true });
        }
      }, 500);
    } catch (err) {
      // Error is handled by Redux state
      console.error('Signup failed:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSignup} sx={{ maxWidth: 400, mx: 'auto', p: 3 }}>
      <Typography variant="h5" mb={2} textAlign="center">Đăng ký</Typography>
      
      <TextField 
        label="Tên" 
        type="text" 
        fullWidth 
        margin="normal" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      
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
        {loading ? <CircularProgress size={24} /> : 'Đăng ký'}
      </Button>
      
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mt: 2 }}>{successMsg}</Alert>}
    </Box>
  );
}
