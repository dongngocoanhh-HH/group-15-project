import React, { useState } from "react";
import UserList from "./components/UserList";
import AddUser from "./components/AddUser";
import "./App.css";

function App() {
  // refreshFlag để ép UserList fetch lại khi có user mới
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleUserAdded = (newUser) => {
    // tăng flag để re-fetch
    setRefreshFlag((f) => f + 1);
  };

  return (
    <div className="container">
      <h1>Quản lý Users</h1>
      <div className="grid">
        <AddUser onUserAdded={handleUserAdded} />
        <UserList refreshFlag={refreshFlag} />
      </div>
    </div>
  );
}

export default App;
