import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/users`);
      setUsers(res.data || []);
    } catch (err) {
      console.error('fetchUsers error', err);
      // Optionally set an error state and show UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // helper functions để dùng ở component
  const addUserLocal = (user) => setUsers(prev => [...prev, user]);
  const updateUserLocal = (updated) => setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  const removeUserLocal = (id) => setUsers(prev => prev.filter(u => u.id !== id));

  return (
    <UserContext.Provider value={{
      users,
      setUsers,
      loading,
      fetchUsers,
      addUserLocal,
      updateUserLocal,
      removeUserLocal,
      API
    }}>
      {children}
    </UserContext.Provider>
  );
}
