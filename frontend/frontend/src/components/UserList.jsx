import React, { useEffect, useState } from 'react';
import { getUsers } from '../api';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      // assume backend returns array in res.data
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Lỗi khi lấy dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <div>
      <h2>Danh sách users</h2>
      {users.length === 0 ? (
        <div>Chưa có user nào.</div>
      ) : (
        <table style={{width:'100%', borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{border:'1px solid #ddd', padding:'8px'}}>ID</th>
              <th style={{border:'1px solid #ddd', padding:'8px'}}>Name</th>
              <th style={{border:'1px solid #ddd', padding:'8px'}}>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id || u._id}>
                <td style={{border:'1px solid #ddd', padding:'8px'}}>{u.id ?? u._id ?? '-'}</td>
                <td style={{border:'1px solid #ddd', padding:'8px'}}>{u.name}</td>
                <td style={{border:'1px solid #ddd', padding:'8px'}}>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={fetch} style={{marginTop:12}}>Refresh</button>
    </div>
  );
}
