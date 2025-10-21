import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  // fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Fetch users error', err);
      alert('Lỗi khi lấy danh sách users. Xem console.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert('Vui lòng nhập tên và email');
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/users`, form);
      // server trả về object { id, name, email }
      setUsers(prev => [...prev, res.data]);
      setForm({ name: '', email: '' });
    } catch (err) {
      console.error('Create error', err);
      alert('Tạo user thất bại. Xem console.');
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setForm({ name: user.name || '', email: user.email || '' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setForm({ name: '', email: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await axios.put(`${API_BASE}/users/${editingUser.id}`, form);
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? res.data : u)));
      setEditingUser(null);
      setForm({ name: '', email: '' });
    } catch (err) {
      console.error('Update error', err);
      alert('Cập nhật thất bại. Xem console.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn muốn xóa?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Delete error', err);
      alert('Xóa thất bại. Xem console.');
    }
  };

  return (
    <div>
      <section style={{ marginBottom: 20 }}>
        <h2>{editingUser ? 'Cập nhật user' : 'Tạo user mới'}</h2>
        <form onSubmit={editingUser ? handleUpdate : handleCreate} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            style={{ padding: 8, minWidth: 200 }}
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{ padding: 8, minWidth: 250 }}
          />
          <button type="submit" style={{ padding: '8px 12px' }}>
            {editingUser ? 'Cập nhật' : 'Tạo'}
          </button>
          {editingUser && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 12px' }}>
              Hủy
            </button>
          )}
        </form>
      </section>

      <section>
        <h2>Danh sách users</h2>
        {loading ? (
          <p>Đang tải...</p>
        ) : users.length === 0 ? (
          <p>Chưa có user</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={td}>{user.name}</td>
                  <td style={td}>{user.email}</td>
                  <td style={td}>
                    <button onClick={() => handleEditClick(user)} style={actionBtn}>Sửa</button>
                    <button onClick={() => handleDelete(user.id)} style={{ ...actionBtn, marginLeft: 8 }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// styles
const th = { textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 0' };
const td = { padding: '8px 0', borderBottom: '1px solid #f1f1f1' };
const actionBtn = { padding: '6px 10px', cursor: 'pointer' };
