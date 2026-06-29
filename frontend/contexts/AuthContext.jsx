<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const persistAuthSession = (setUserState, payload) => {
  const normalizedUser = payload?.user || payload;

  if (!normalizedUser) {
    return null;
  }

  flushSync(() => {
    setUserState(normalizedUser);
  });

  localStorage.setItem('user', JSON.stringify(normalizedUser));

  if (payload?.token) {
    localStorage.setItem('token', payload.token);
  }

  return normalizedUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to restore auth session:', error);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    persistAuthSession(setUser, response);
    return response;
  };

  const loginWithGoogle = async () => {
    return await authService.loginWithGoogle();
  };

  const handleGoogleCallback = async () => {
    const response = await authService.handleGoogleCallback();
    persistAuthSession(setUser, response);
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    persistAuthSession(setUser, response);
    return response;
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, handleGoogleCallback, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user); // Store only the user object, not the whole response
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token); // Store token separately
    return response;
  };

  const loginWithGoogle = async () => {
    return await authService.loginWithGoogle();
  };

  const handleGoogleCallback = async () => {
    const response = await authService.handleGoogleCallback();
    setUser(response.user); // Store only the user object, not the whole response
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token); // Store token separately
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user); // Store only the user object, not the whole response
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token); // Store token separately
    return response;
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, handleGoogleCallback, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
