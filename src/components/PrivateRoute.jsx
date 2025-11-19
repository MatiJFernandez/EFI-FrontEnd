import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole, requiredRoles, redirectTo = "/login" }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mientras se restaura la sesión, no redirigir
  if (loading) {
    return null; // también podríamos renderizar un spinner
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalizar roles requeridos a un array si aplica
  const requiredRolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : (requiredRole ? [requiredRole] : null);

  // Si se requieren roles específicos y el usuario no tiene alguno de ellos
  if (requiredRolesArray && !requiredRolesArray.includes(user?.role)) {
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
