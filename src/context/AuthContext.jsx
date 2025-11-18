import { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth/authService';
import usersService from '../services/users/usersService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem('token');
    
    if (currentUser && storedToken) {
      setUser(currentUser);
      setToken(storedToken);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const result = await authService.resetPassword(resetData);
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const getUserProfile = async () => {
    try {
      const result = await usersService.getUserProfile();
      if (result.success) {
        setUser(result.data);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Get user profile error:', error);
      return { success: false, error: 'Error al obtener el perfil del usuario' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    forgotPassword,
    resetPassword,
    getUserProfile,
    loading,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
