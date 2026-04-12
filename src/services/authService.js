import api from './api';
import { supabase } from '../config/supabase';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
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

    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
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
