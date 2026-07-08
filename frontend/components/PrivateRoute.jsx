import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  // Get the user's role
  const userRole = user.role;
  const currentPath = location.pathname;

  // Define role-based redirects
  if (userRole === 'admin') {
    // Admin should only access /admin/* routes
    if (!currentPath.startsWith('/admin')) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else if (userRole === 'vet') {
    // Vet should only access /vet/* routes
    if (!currentPath.startsWith('/vet')) {
      return <Navigate to="/vet/dashboard" replace />;
    }
  } else {
    // Regular users should not access /admin/* or /vet/* routes
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/vet')) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute;
