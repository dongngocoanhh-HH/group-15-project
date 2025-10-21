// EditUserForm.jsx
import React, { useState, useEffect } from 'react';

export default function EditUserForm({ initialData, onCancel, onSave, saving }) {
  const [form, setForm] = useState({ id: null, name: '', email: '' });

  useEffect(() => {
    if (initialData) {
      setForm({ id: initialData.id, name: initialData.name || '', email: initialData.email || '' });
    } else {
      setForm({ id: null, name: '', email: '' });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 16, border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>{form.id ? 'Sửa user' : 'Tạo user mới'}</h3>
      <div>
        <label>
          Name:
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
      </div>
      <div>
        <label>
          Email:
          <input name="email" value={form.email} onChange={handleChange} required />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button type="submit" disabled={saving}>{saving ? 'Đang lưu...' : (form.id ? 'Lưu (PUT)' : 'Tạo (POST)')}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Hủy</button>
      </div>
    </form>
  );
}
