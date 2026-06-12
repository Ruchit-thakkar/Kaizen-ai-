import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { socket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check active session status on mount
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          // Authenticate and open Socket.IO connection
          if (!socket.connected) {
            socket.connect();
          }
        }
      } catch (err) {
        // Silent catch: user is unauthenticated on boot
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyUserSession();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        // Connect socket on successful login
        socket.connect();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      const res = await api.post('/auth/signup', { name, email, password });
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        // Connect socket on successful registration
        socket.connect();
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign up failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('API logout error:', err);
    } finally {
      setUser(null);
      setError(null);
      // Disconnect socket session
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
