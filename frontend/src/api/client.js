import axios from 'axios';

// API Base URL resolution:
// 1. If VITE_API_URL environment variable is provided, use it
// 2. In production builds: fallback directly to your hosted API URL (https://crm-xi-brown-43.vercel.app/api/v1)
// 3. In local development: fallback to relative '/api/v1' (routed via Vite proxy)
const defaultUrl = import.meta.env.DEV
  ? '/api/v1'
  : 'https://crm-xi-brown-43.vercel.app/api/v1';

const rawBaseUrl = import.meta.env.VITE_API_URL || defaultUrl;
const baseURL = rawBaseUrl.endsWith('/api/v1')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api/v1`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
