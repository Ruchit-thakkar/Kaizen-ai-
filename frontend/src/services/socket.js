import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create a single Socket.IO instance for the entire app
export const socket = io(BACKEND_URL, {
  autoConnect: false,
  withCredentials: true
});
