import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import authReducer from './slices/authSlice';

/**
 * Redux Store Configuration
 * Với Redux Persist để lưu state vào localStorage
 */

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Chỉ persist auth state
};

const persistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production' // Enable Redux DevTools
});

export const persistor = persistStore(store);
