import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../context/UserContext';

export default function AddUser({ editingUser, clearEditing }) {
  const { fetchUsers, addUserLocal, updateUserLocal, API } = useContext(UserContext);

  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setForm({ name: editingUser.name || '', email: editingUser.email || '' });
      setErrors({});
    } else {
      setForm({ name: '', email: '' });
      setErrors({});
    }
  }, [editingUser]);

  const validate = () => {
    const e = {};
    if (!form.name || !form.name.trim()) e.name = 'Name không được để trống';
    // đơn giản nhưng hiệu quả: kiểm tra cấu trúc email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!form.email || !emailRegex.test(form.email)) e.email = 'Email không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    setForm({ ...form, [ev.target.name]: ev.target.value });
    // realtime clear specific error
    setErrors(prev => ({ ...prev, [ev.target.name]: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingUser) {
        // PUT
        const res = await axios.put(`${API}/users/${editingUser.id}`, form);
        // cập nhật local state qua context helper
        updateUserLocal(res.data);
        clearEditing();
      } else {
        // POST
        const res = await axios.post(`${API}/users`, form);
        // add local để UI cập nhật ngay
        addUserLocal(res.data);
      }
      // optional: fetchUsers() nếu bạn muốn đồng bộ từ server
      // await fetchUsers();
      setForm({ name: '', email: '' });
      setErrors({});
    } catch (err) {
      console.error('submit error', err);
      // Nếu server trả lỗi cụ thể (vd duplicate email), show message
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert('Lỗi khi lưu user. Xem console.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 8 }}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          disabled={submitting}
          style={{ padding: 8, width: 300 }}
        />
        {errors.name && <div style={{ color: 'red', marginTop: 4 }}>{errors.name}</div>}
      </div>

      <div style={{ marginBottom: 8 }}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={submitting}
          style={{ padding: 8, width: 300 }}
        />
        {errors.email && <div style={{ color: 'red', marginTop: 4 }}>{errors.email}</div>}
      </div>

      <div>
        <button type="submit" disabled={submitting} style={{ padding: '8px 12px' }}>
          {editingUser ? (submitting ? 'Đang cập nhật...' : 'Cập nhật') : (submitting ? 'Đang tạo...' : 'Thêm')}
        </button>

        {editingUser && (
          <button type="button" onClick={clearEditing} style={{ marginLeft: 8 }}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
