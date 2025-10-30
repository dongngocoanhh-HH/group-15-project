import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Box,
  Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Alert, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl,
  InputLabel, Chip, Checkbox, FormGroup, FormControlLabel, Grid, Card, CardContent,
  Tabs, Tab, Pagination, TableContainer
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import { 
  adminGetUsers, 
  adminDeleteUser, 
  updateUserRole, 
  toggleUserStatus,
  getUserStats 
} from '../services/userService';
import { getActivityLogs, getActivityStats } from '../services/activityService';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // Tab management
  const [currentTab, setCurrentTab] = useState(0);

  // Activity logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [logsFilter, setLogsFilter] = useState({ action: '', status: '' });
  const [activityStats, setActivityStats] = useState(null);

  // Edit role dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('user');
  const [editPermissions, setEditPermissions] = useState([]);

  async function load() {
    setLoading(true);
    setErr(null); setMsg(null);
    try {
      // Load stats
      const statsRes = await getUserStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      // Load users
      const res = await adminGetUsers();
      console.log('Admin - adminGetUsers response:', res);
      if (!res.success) {
        setErr(res.message || 'Không tải được danh sách user');
        setUsers([]);
      } else {
        const list = Array.isArray(res.users) ? res.users : [];
        console.log('Admin - users list:', list);
        setUsers(list);
      }
    } catch (error) {
      console.error('Admin - load error:', error);
      setErr('Lỗi kết nối server');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  useEffect(() => {
    if (currentTab === 1) {
      loadActivityLogs();
      loadActivityStats();
    }
    /* eslint-disable-next-line */
  }, [currentTab, logsPagination.page, logsFilter]);

  const loadActivityLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await getActivityLogs({
        page: logsPagination.page,
        limit: logsPagination.limit,
        action: logsFilter.action || undefined,
        status: logsFilter.status || undefined
      });
      
      if (res.success) {
        setLogs(res.data.logs);
        setLogsPagination(prev => ({
          ...prev,
          total: res.data.pagination.total,
          totalPages: res.data.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Error loading activity logs:', error);
      setErr('Không thể tải logs');
    } finally {
      setLogsLoading(false);
    }
  };

  const loadActivityStats = async () => {
    try {
      const res = await getActivityStats(7); // Last 7 days
      if (res.success) {
        setActivityStats(res.data);
      }
    } catch (error) {
      console.error('Error loading activity stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa tài khoản này?')) return;
    try {
      const res = await adminDeleteUser(id);
      if (!res.success) return setErr(res.message || 'Xóa thất bại');
      setUsers(prev => prev.filter(u => String(u._id) !== String(id) && String(u.id) !== String(id)));
      setMsg('Đã xóa user');
    } catch {
      setErr('Lỗi kết nối server');
    }
  };

  const handleEditRole = (user) => {
    setEditUser(user);
    setEditRole(user.role || 'user');
    setEditPermissions(user.permissions || []);
    setEditDialog(true);
  };

  const handleSaveRole = async () => {
    if (!editUser) return;
    
    try {
      const res = await updateUserRole(editUser.id || editUser._id, editRole, editPermissions);
      if (!res.success) {
        setErr(res.message || 'Cập nhật thất bại');
        return;
      }
      
      setMsg(res.message || 'Cập nhật role thành công');
      setEditDialog(false);
      load(); // Reload danh sách
    } catch {
      setErr('Lỗi kết nối server');
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.isActive ? 'vô hiệu hóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
    
    try {
      const res = await toggleUserStatus(user.id || user._id);
      if (!res.success) {
        setErr(res.message || 'Thay đổi trạng thái thất bại');
        return;
      }
      
      setMsg(res.message || 'Đã thay đổi trạng thái');
      load(); // Reload
    } catch {
      setErr('Lỗi kết nối server');
    }
  };

  const handlePermissionToggle = (permission) => {
    setEditPermissions(prev => 
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  const allPermissions = ['manage_users', 'manage_posts', 'view_reports', 'delete_content'];
  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'error';
    if (role === 'moderator') return 'warning';
    return 'default';
  };

  const getActionColor = (action) => {
    if (action === 'LOGIN' || action === 'REGISTER') return 'success';
    if (action === 'LOGIN_FAILED') return 'error';
    if (action === 'LOGOUT') return 'default';
    if (action.includes('DELETE')) return 'error';
    if (action.includes('UPDATE') || action.includes('CHANGED')) return 'warning';
    return 'info';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        👑 Admin Dashboard
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="Quản lý Users" />
          <Tab label="Activity Logs" />
        </Tabs>
      </Box>

      {/* Stats Cards */}
      {currentTab === 0 && stats && (
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
                  Regular Users
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.byRole?.user || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* User Management Tab */}
      {currentTab === 0 && (
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
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow key={u.id || u._id || idx}>
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
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditRole(u)} 
                      title="Sửa role"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color={u.isActive ? 'warning' : 'success'}
                      onClick={() => handleToggleStatus(u)} 
                      title={u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      size="small"
                    >
                      {u.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDelete(u.id || u._id)} 
                      title="Xóa"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
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
      )}

      {/* Activity Logs Tab */}
      {currentTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">📊 Activity Logs</Typography>
            <IconButton onClick={loadActivityLogs} color="primary" title="Refresh">
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Activity Stats */}
          {activityStats && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Total Activities
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {activityStats.actionStats?.reduce((sum, item) => sum + item.count, 0) || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activityStats.period}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'error.light' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Failed Logins
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {activityStats.failedLogins || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activityStats.period}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Successful Actions
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {activityStats.statusStats?.find(s => s._id === 'SUCCESS')?.count || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activityStats.period}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: 'warning.light' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      Active Users
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {activityStats.topUsers?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Most active
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Action</InputLabel>
              <Select
                value={logsFilter.action}
                label="Action"
                onChange={(e) => setLogsFilter(prev => ({ ...prev, action: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="LOGIN">LOGIN</MenuItem>
                <MenuItem value="LOGIN_FAILED">LOGIN_FAILED</MenuItem>
                <MenuItem value="LOGOUT">LOGOUT</MenuItem>
                <MenuItem value="REGISTER">REGISTER</MenuItem>
                <MenuItem value="PASSWORD_RESET_REQUEST">PASSWORD_RESET</MenuItem>
                <MenuItem value="PROFILE_UPDATE">PROFILE_UPDATE</MenuItem>
                <MenuItem value="USER_CREATED">USER_CREATED</MenuItem>
                <MenuItem value="USER_DELETED">USER_DELETED</MenuItem>
                <MenuItem value="ROLE_CHANGED">ROLE_CHANGED</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={logsFilter.status}
                label="Status"
                onChange={(e) => setLogsFilter(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="SUCCESS">SUCCESS</MenuItem>
                <MenuItem value="FAILED">FAILED</MenuItem>
                <MenuItem value="WARNING">WARNING</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Logs Table */}
          {logsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!logsLoading && logs.length > 0 ? (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log, idx) => (
                      <TableRow key={log._id || idx}>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          {log.userId ? (
                            <Box>
                              <Typography variant="body2">
                                {log.userId.username || log.userId.name || 'Unknown'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.userId.email}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {log.email || 'Anonymous'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            size="small" 
                            color={getActionColor(log.action)}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.status} 
                            size="small" 
                            color={log.status === 'SUCCESS' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem' }}>
                          {log.ipAddress || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', maxWidth: 200 }}>
                          {log.details && Object.keys(log.details).length > 0 ? (
                            <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                              {JSON.stringify(log.details).substring(0, 50)}...
                            </Typography>
                          ) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={logsPagination.totalPages} 
                  page={logsPagination.page}
                  onChange={(e, page) => setLogsPagination(prev => ({ ...prev, page }))}
                  color="primary"
                />
              </Box>
            </>
          ) : (!logsLoading && (
            <Typography sx={{ py: 2, color: 'text.secondary', textAlign: 'center' }}>
              Không có logs.
            </Typography>
          ))}
        </Paper>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa Role & Permissions</DialogTitle>
        <DialogContent>
          {editUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>User:</strong> {editUser.name} ({editUser.email})
              </Typography>

              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editRole}
                  label="Role"
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>

              {editRole === 'moderator' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Permissions (chỉ cho Moderator):
                  </Typography>
                  <FormGroup>
                    {allPermissions.map(perm => (
                      <FormControlLabel
                        key={perm}
                        control={
                          <Checkbox
                            checked={editPermissions.includes(perm)}
                            onChange={() => handlePermissionToggle(perm)}
                          />
                        }
                        label={perm}
                      />
                    ))}
                  </FormGroup>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Hủy</Button>
          <Button onClick={handleSaveRole} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
