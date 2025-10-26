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
} from '@mui/material';
import { getProfile, updateProfile, uploadAvatar } from '../services/userService';

export default function Profile() {
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: 'info', text: '' });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
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
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: 'info', text: '' });
    const res = await updateProfile({ name, avatar }, token);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: res.message || 'Cập nhật thành công' });
    } else {
      setMsg({ type: 'error', text: res.message || 'Cập nhật thất bại' });
    }
  };

  const onPickFile = () => inputRef.current?.click();

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setMsg({ type: 'info', text: '' });

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
      <Typography variant="h5" fontWeight={700} mb={2}>
        Thông tin cá nhân
      </Typography>

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
    </Container>
  );
}
