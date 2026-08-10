import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create configured Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Request interceptor to automatically add authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (err) {
      console.error('Failed to validate token:', err);
      // Clear expired/invalid token
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Validate token and fetch user on load
  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error.response?.data?.detail || 'Login failed. Please try again.';
    }
  };

  const register = async (email, password, fullName, role = 'user') => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Registration failed. Please try again.';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/me/profile', profileData);
      // Update the user state locally with the new profile data
      setUser((prevUser) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          profile: response.data,
        };
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Profile update failed.';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser,
        isAuthenticated: !!user,
      }}
    >
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
export default AuthContext;
