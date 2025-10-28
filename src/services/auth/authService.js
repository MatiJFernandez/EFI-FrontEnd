import api from '../api/api.js';
import { setAuthToken, removeAuthToken } from '../api/api.js';

/**
 * Servicio de autenticación
 * Maneja las operaciones de login, registro y logout con el backend
 */
export const authService = {
  /**
   * Inicia sesión con el backend
   * @param {Object} credentials - Credenciales de login
   * @param {string} credentials.username - Nombre de usuario
   * @param {string} credentials.password - Contraseña
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;

      // Guardar token y usuario en localStorage
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Registra un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.firstName - Nombre
   * @param {string} userData.lastName - Apellido
   * @param {string} userData.email - Email
   * @param {string} userData.username - Nombre de usuario
   * @param {string} userData.password - Contraseña
   * @returns {Promise<Object>} Resultado del registro
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      // Guardar token y usuario en localStorage
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || 'Error al registrar usuario';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Cierra sesión
   */
  logout() {
    removeAuthToken();
    localStorage.removeItem('user');
  },

  /**
   * Obtiene el usuario actual desde localStorage
   * @returns {Object|null} Usuario actual o null
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Verifica si hay una sesión activa
   * @returns {boolean} true si hay una sesión activa
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Solicita restablecimiento de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Resultado de la solicitud
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Error al procesar la solicitud';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Restablece la contraseña con el token recibido por email
   * @param {Object} resetData - Datos para restablecer la contraseña
   * @param {string} resetData.token - Token de restablecimiento
   * @param {string} resetData.password - Nueva contraseña
   * @returns {Promise<Object>} Resultado del restablecimiento
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña';
      return { success: false, error: errorMessage };
    }
  }
};

export default authService;
