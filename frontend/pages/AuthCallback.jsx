import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const getDashboardPath = (userData) => {
  if (userData?.role === 'admin') return '/admin/dashboard';
  if (userData?.role === 'vet') return '/vet/dashboard';
  return '/';
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const response = await handleGoogleCallback();
        const userData = response?.user || response;
        navigate(getDashboardPath(userData), { replace: true });
      } catch (error) {
        console.error('Google auth callback error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    processCallback();
  }, [handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
