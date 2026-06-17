import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5000/api'
    : 'https://kaizen-ai-yj4p.onrender.com/api');

// Pre-configured Axios instance for handling credentials (HTTP-only cookies)
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
