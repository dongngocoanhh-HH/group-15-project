import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Box,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { adminGetUsers, adminDeleteUser } from '../services/userService';
import { getAccessToken } from '../services/authService';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function load() {
    setLoading(true);
    setErr(null); setMsg(null);
    try {
      // Không cần truyền token vì adminGetUsers đã có default parameter
      const res = await adminGetUsers();
      console.log('Admin - adminGetUsers response:', res); // DEBUG
      if (!res.success) {
        setErr(res.message || 'Không tải được danh sách user');
        setUsers([]);
      } else {
        const list = Array.isArray(res.users) ? res.users : [];
        console.log('Admin - users list:', list); // DEBUG
        setUsers(list);
      }
    } catch (error) {
      console.error('Admin - load error:', error); // DEBUG
      setErr('Lỗi kết nối server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      // Không cần truyền token vì adminDeleteUser đã có default parameter
      const res = await adminDeleteUser(id);
      if (!res.success) return setErr(res.message || 'Xóa thất bại');
      setUsers(prev => prev.filter(u => String(u._id) !== String(id) && String(u.id) !== String(id)));
      setMsg('Đã xóa user');
    } catch {
      setErr('Lỗi kết nối server');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Quản lý người dùng</Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {!loading && msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

        {!loading && Array.isArray(users) && users.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow key={u.id || u._id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role || 'user'}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(u.id || u._id)} title="Xóa">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (!loading && !err && (
          <Typography sx={{ py: 2, color: 'text.secondary' }}>Không có người dùng.</Typography>
        ))}
      </Paper>
    </Container>
  );
}
