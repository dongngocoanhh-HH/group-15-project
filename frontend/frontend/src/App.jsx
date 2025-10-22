import React from 'react';
import UserList from './components/UserList';

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>Quản lý User (CRUD + Validation)</h1>
      <UserList />
    </div>
  );
}

export default App;
