import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const resp = await authService.getCurrentUser();
          if (resp.success) {
            setUser(resp.data);
            localStorage.setItem('user', JSON.stringify(resp.data));
          }
        } catch (e) {
          console.warn('Authentication token verification failed', e);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    const resp = await authService.login({ email, password });
    if (resp.success) {
      const { user: userData, access_token } = resp.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return resp;
  };

  const register = async (userData) => {
    const resp = await authService.register(userData);
    if (resp.success) {
      const { user: newUserData, access_token } = resp.data;
      setToken(access_token);
      setUser(newUserData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(newUserData));
    }
    return resp;
  };

  const updateProfile = async (profileData) => {
    const resp = await authService.updateProfile(profileData);
    if (resp.success) {
      setUser(resp.data);
      localStorage.setItem('user', JSON.stringify(resp.data));
    }
    return resp;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
