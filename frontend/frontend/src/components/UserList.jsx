import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserList({ refreshFlag }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:3000/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Không thể lấy danh sách user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshFlag]); // refresh khi refreshFlag thay đổi

  if (loading) return <div>Đang tải danh sách...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="card list">
      <h3>Danh sách user</h3>
      {users.length === 0 ? (
        <p>Chưa có user nào.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u._id || u.id}>
              <strong>{u.name}</strong> — {u.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
