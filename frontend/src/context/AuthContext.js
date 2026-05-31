import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api', withCredentials: true });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('km_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('km_token');
      localStorage.removeItem('km_user');
    }
    return Promise.reject(error);
  }
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('km_token');
    const savedUser = localStorage.getItem('km_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      API.get('/auth/me').then(r => {
        setUser(r.data.user);
        localStorage.setItem('km_user', JSON.stringify(r.data.user));
      }).catch(() => {
        localStorage.removeItem('km_token');
        localStorage.removeItem('km_user');
        setUser(null);
      });
    }
    setLoading(false);
  }, []);

  const login = async (mobile, password) => {
    const { data } = await API.post('/auth/login', { mobile, password });
    localStorage.setItem('km_token', data.token);
    localStorage.setItem('km_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('km_token', data.token);
    localStorage.setItem('km_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('km_token');
    localStorage.removeItem('km_user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await API.put('/auth/profile', profileData);
    setUser(data.user);
    localStorage.setItem('km_user', JSON.stringify(data.user));
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
export { API };
