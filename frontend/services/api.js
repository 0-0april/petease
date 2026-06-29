<<<<<<< HEAD
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5002/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  // Try to get token from separate storage first, then fall back to old format
  let token = localStorage.getItem('token');
  
  if (!token) {
    // Fallback: check if token is stored in user object (old format)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user.token;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
=======
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  // Try to get token from separate storage first, then fall back to old format
  let token = localStorage.getItem('token');
  
  if (!token) {
    // Fallback: check if token is stored in user object (old format)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user.token;
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
