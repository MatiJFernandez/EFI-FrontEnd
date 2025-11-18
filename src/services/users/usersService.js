import api from '../api/api.js';

/**
 * Servicio de usuarios
 * Maneja las operaciones relacionadas con usuarios
 */
export const usersService = {
  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Perfil del usuario
   */
  async getUserProfile() {
    try {
      const response = await api.get('/users/profile');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener el perfil del usuario'
      };
    }
  }
};

export default usersService;
