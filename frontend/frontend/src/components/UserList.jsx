import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import AddUser from './AddUser';
import axios from 'axios';

export default function UserList() {
  const { users, loading, removeUserLocal, API } = useContext(UserContext);
  const [editingUser, setEditingUser] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Chắc chắn xóa?')) return;
    try {
      await axios.delete(`${API}/users/${id}`);
      removeUserLocal(id);
    } catch (err) {
      console.error('delete error', err);
      alert('Xóa thất bại');
    }
  };

  return (
    <div>
      <AddUser editingUser={editingUser} clearEditing={() => setEditingUser(null)} />

      <h3>Danh sách users</h3>
      {loading ? <p>Đang tải...</p> :
        users.length === 0 ? <p>Chưa có user</p> :
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
              <th style={{ textAlign: 'left', padding: 8 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: 8 }}>{u.name}</td>
                <td style={{ padding: 8 }}>{u.email}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => setEditingUser(u)}>Sửa</button>
                  <button onClick={() => handleDelete(u.id)} style={{ marginLeft: 8 }}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}
