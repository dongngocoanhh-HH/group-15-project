import React, { useState } from 'react';
import axios from 'axios';

export default function AddUser({ onAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f || null);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name || !email) {
      setError('Vui lòng nhập tên và email.');
      return;
    }

    const fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    if (file) fd.append('avatar', file); // <--- field name 'avatar' (thông báo cho backend)

    setSaving(true);
    try {
  const res = await axios.post('http://localhost:3000/api/users', fd);
  onAdded?.(res.data);
} catch (err) {
  console.error(err);
  const data = err.response?.data;
  if (data?.message) setError(data.message);
  else if (data?.error?.keyValue) {
    const k = Object.keys(data.error.keyValue)[0];
    setError(`${k} đã tồn tại: ${data.error.keyValue[k]}`);
  } else {
    setError(err.message || 'Lỗi khi thêm user');
  }
}

   
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Thêm user</h2>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Tên:<br />
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>
            Email:<br />
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Avatar (file):<br />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          {preview && (
            <div style={{ marginTop: 8 }}>
              <small>Preview:</small><br />
              <img src={preview} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 6 }} />
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Đang gửi...' : 'Thêm user'}
        </button>
      </form>
    </div>
  );
}
