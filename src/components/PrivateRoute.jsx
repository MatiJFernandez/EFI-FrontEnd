import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole, redirectTo = "/login" }) => {
  const { isAuthenticated, user } = useAuth();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && user?.role !== requiredRole) {
    // Redirigir según el rol del usuario
    switch (user?.role) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'moderator':
        return <Navigate to="/moderator" />;
      case 'user':
      default:
        return <Navigate to="/dashboard" />;
    }
  }

  return children;
};

export default PrivateRoute;
