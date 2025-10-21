import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// helper
export const getUsers = () => api.get('/users');
export const createUser = (user) => api.post('/users', user);
export const createUserForm = (formData) =>
  api.post('/api/users', formData);