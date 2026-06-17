import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5000'
    : 'https://kaizen-ai-yj4p.onrender.com');

// Create a single Socket.IO instance for the entire app
export const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true
});
