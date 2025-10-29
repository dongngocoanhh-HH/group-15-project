import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js'; // Explicitly import App.js with routing
import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
);
