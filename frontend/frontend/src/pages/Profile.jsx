// frontend/src/pages/Profile.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import { getProfile, updateProfile, uploadAvatar } from '../services/userService';
import { logout, getAccessToken, getUser } from '../services/authService';

export default function Profile({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: 'info', text: '' });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const token = getAccessToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Load thông tin user từ localStorage hoặc API
    const cachedUser = getUser();
    if (cachedUser) {
      setName(cachedUser.name || '');
      setEmail(cachedUser.email || '');
      setAvatar(cachedUser.avatar || '');
    }

    let ignore = false;
    (async () => {
      setLoading(true);
      const res = await getProfile(token);
      if (!ignore) {
        if (res.success) {
          const u = res.user;
          setName(u.name || '');
          setEmail(u.email || '');
          setAvatar(u.avatar || '');
          setMsg({ type: 'success', text: '' });
        } else {
          setMsg({ type: 'error', text: res.message || 'Không thể tải thông tin' });
        }
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: 'info', text: '' });
    const token = getAccessToken();
    const res = await updateProfile({ name, avatar }, token);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Cập nhật thành công' });
    } else {
      setMsg({ type: 'error', text: res.message || 'Cập nhật thất bại' });
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      // Dùng logout handler từ App.js để đồng bộ state
      onLogout();
    } else {
      // Fallback nếu không có prop
      await logout();
      window.location.href = '/login';
    }
  };

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setMsg({ type: 'info', text: '' });

    const token = getAccessToken();
    // gọi API uploadAvatar (đã export từ userService)
    const res = await uploadAvatar(file, token);
    if (res.success && res.url) {
      setAvatar(res.url); // gán URL mới vào form
      setMsg({ type: 'success', text: 'Upload thành công' });
    } else {
      setMsg({ type: 'error', text: res.message || 'Lỗi upload ảnh' });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Thông tin cá nhân
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Box>

      {msg.text ? <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert> : null}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar src={avatar || undefined} sx={{ width: 80, height: 80 }}>
          {!avatar ? (name?.[0]?.toUpperCase() || 'A') : null}
        </Avatar>

        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
        <Button variant="outlined" onClick={onPickFile}>
          CHỌN ẢNH…
        </Button>
      </Box>

      <Box component="form" onSubmit={handleUpdate}>
        <TextField
          label="Tên"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          disabled
        />

        <TextField
          label="Avatar URL"
          fullWidth
          sx={{ mb: 2 }}
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Đang lưu…' : 'CẬP NHẬT'}
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Paper elevation={2} sx={{ p: 3, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          🔐 Refresh Token Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Access Token hết hạn sau 15 phút. Khi bạn gọi API sau khi token hết hạn, 
          hệ thống sẽ tự động làm mới token bằng Refresh Token và thực hiện lại request.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Refresh Token hết hạn sau 7 ngày. Nếu Refresh Token hết hạn, bạn sẽ được 
          chuyển về trang đăng nhập.
        </Typography>
      </Paper>
    </Container>
  );
}
