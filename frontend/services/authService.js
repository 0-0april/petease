import api from './api';
import { supabase } from '../config/supabase';

const getGoogleRedirectUrl = () => {
  const configuredRedirect = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();

  if (configuredRedirect && !configuredRedirect.includes('localhost')) {
    return configuredRedirect;
  }

  return `${window.location.origin}/auth/callback`;
};

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  loginWithGoogle: async () => {
    const redirectTo = getGoogleRedirectUrl();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });
    
    if (error) throw error;
    return data;
  },

  handleGoogleCallback: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session) throw new Error('No session found');

    // Send Google user data to backend to create/login user
    const response = await api.post('/auth/google', {
      email: session.user.email,
      name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
      googleId: session.user.id,
      avatar: session.user.user_metadata.avatar_url
    });

    if (response.data?.token && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('user');
    supabase.auth.signOut();
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
};
