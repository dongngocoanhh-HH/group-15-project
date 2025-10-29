// frontend/src/pages/Moderator.jsx
import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Box,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Alert, CircularProgress, TextField, MenuItem, Select,
  FormControl, InputLabel, Grid, Card, CardContent
} from '@mui/material';
import { getManagedUsers, getUserStats } from '../services/userService';
import { getUser } from '../services/authService';

export default function Moderator() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  
  const [filters, setFilters] = useState({
    role: '',
    isActive: '',
    search: ''
  });

  const currentUser = getUser();

  async function loadData() {
    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      // Load stats
      const statsRes = await getUserStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // Load users
      const usersRes = await getManagedUsers(filters);
      console.log('Moderator - getManagedUsers response:', usersRes);
      
      if (!usersRes.success) {
        setErr(usersRes.message || 'Không tải được danh sách user');
        setUsers([]);
      } else {
        setUsers(usersRes.users || []);
      }
    } catch (error) {
      console.error('Moderator - load error:', error);
      setErr('Lỗi kết nối server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, [filters.role, filters.isActive]);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'error';
    if (role === 'moderator') return 'warning';
    return 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        🛡️ Moderator Dashboard
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Tổng Users
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.active || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Moderators
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.byRole?.moderator || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'error.light' }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Admins
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.byRole?.admin || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Danh sách người dùng
        </Typography>

        {/* Permissions Info */}
        {currentUser?.permissions && currentUser.permissions.length > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              Quyền của bạn:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {currentUser.permissions.map(perm => (
                <Chip key={perm} label={perm} size="small" color="primary" />
              ))}
            </Box>
          </Box>
        )}

        {/* Filters */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            label="Tìm kiếm (tên, email)"
            value={filters.search}
            onChange={handleSearchChange}
            size="small"
            sx={{ flex: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role}
              label="Role"
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={filters.isActive}
              label="Trạng thái"
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
                <TableCell>Trạng thái</TableCell>
                <TableCell>Permissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow key={u.id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{u.name || '-'}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={u.role || 'user'} 
                      size="small" 
                      color={getRoleBadgeColor(u.role)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={u.isActive ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={u.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {u.permissions && u.permissions.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {u.permissions.map(perm => (
                          <Chip key={perm} label={perm} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (!loading && !err && (
          <Typography sx={{ py: 2, color: 'text.secondary' }}>
            Không có người dùng.
          </Typography>
        ))}
      </Paper>
    </Container>
  );
}
