import axios from 'axios';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL =
  envUrl && !envUrl.includes('localhost')
    ? envUrl
    : `http://${hostname || 'localhost'}:8000`;

const TOKEN_KEY = 'expense_tracker_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default api;
