import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js'; // Explicitly import App.js with routing
import { UserProvider } from './context/UserContext';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { CircularProgress, Box } from '@mui/material';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate 
        loading={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <CircularProgress />
          </Box>
        } 
        persistor={persistor}
      >
        <UserProvider>
          <App />
        </UserProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
