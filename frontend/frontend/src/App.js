import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Lấy danh sách user từ backend
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Lỗi GET api/users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Thêm user mới
  const addUser = async (e) => {
    e.preventDefault();
    try {
      const newUser = { name, email };
      await axios.post("http://localhost:3000/api/users", newUser);
      setName("");
      setEmail("");
      fetchUsers(); // refresh list
    } catch (err) {
      console.error("Lỗi POST api/users:", err);
      alert("Không thêm được user!");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
      <h2>Quản lý Users</h2>
      <form onSubmit={addUser}>
        <div style={{ marginBottom: 10 }}>
          <label>Tên:</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên..."
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Email:</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email..."
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 16px" }}>Thêm user</button>
      </form>

      <h3 style={{ marginTop: 30 }}>Danh sách user</h3>
      <ul>
        {users.length > 0 ? (
          users.map((u) => (
            <li key={u.id || u._id}>
              {u.name} — {u.email}
            </li>
          ))
        ) : (
          <p>Chưa có user nào</p>
        )}
      </ul>
    </div>
  );
}

export default App;
