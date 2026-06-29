import React from 'react';
<<<<<<< HEAD
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
=======
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const userData = await handleGoogleCallback();
        
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'vet') {
          navigate('/vet/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Google auth callback error:', error);
        navigate('/login?error=auth_failed');
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
>>>>>>> 8555e327320ce828f5dfb4efd072c21355eac3c7
