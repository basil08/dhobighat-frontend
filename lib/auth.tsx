'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
  _id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  console.log('API_BASE_URL:', API_BASE_URL);

  // Initialize axios with auth token
  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      console.log('Checking auth with token:', savedToken ? 'exists' : 'none');
      if (savedToken) {
        try {
          console.log('Making request to:', `${API_BASE_URL}/auth/me`);
          const response = await axios.get(`${API_BASE_URL}/auth/me`);
          console.log('Auth check successful:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('auth_token');
          setToken(null);
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [API_BASE_URL]);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      console.log('Login successful, token received:', access_token ? 'yes' : 'no');
      console.log('User data:', userData);
      
      setToken(access_token);
      setUser(userData);
      
      // Save token to cookies
      Cookies.set('auth_token', access_token, { expires: 7 }); // 7 days
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      
      // Save token to cookies
      Cookies.set('auth_token', access_token, { expires: 7 }); // 7 days
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Signup failed. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('auth_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 