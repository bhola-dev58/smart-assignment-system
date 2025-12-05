import axios from 'axios';

// Resolve API base URL from environment; fallback to localhost for dev
const BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL
) ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

// Helpful runtime log to verify environment wiring
try {
  // Only log in development or if explicitly enabled
  const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log('[API] BASE_URL =', BASE_URL);
  }
} catch (_) {}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.clear();
      globalThis.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;