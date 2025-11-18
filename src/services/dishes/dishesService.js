import api from '../api/api.js';

/**
 * Servicio de platos
 * Maneja las operaciones relacionadas con platos del menú
 */
export const dishesService = {
  /**
   * Obtiene todos los platos
   * @param {Object} params - Parámetros de consulta opcionales
   * @param {boolean} params.available - Filtrar por disponibilidad
   * @param {string} params.search - Término de búsqueda
   * @returns {Promise<Object>} Lista de platos
   */
  async getAllDishes(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.available !== undefined) queryParams.append('available', params.available);
      if (params.search) queryParams.append('search', params.search);

      const url = `/dishes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dishes:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener los platos'
      };
    }
  },

  /**
   * Obtiene un plato por ID
   * @param {number} id - ID del plato
   * @returns {Promise<Object>} Datos del plato
   */
  async getDishById(id) {
    try {
      const response = await api.get(`/dishes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dish:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener el plato'
      };
    }
  },

  /**
   * Crea un nuevo plato
   * @param {Object} dishData - Datos del plato
   * @returns {Promise<Object>} Plato creado
   */
  async createDish(dishData) {
    try {
      const response = await api.post('/dishes', dishData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating dish:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear el plato'
      };
    }
  },

  /**
   * Actualiza un plato
   * @param {number} id - ID del plato
   * @param {Object} dishData - Datos actualizados del plato
   * @returns {Promise<Object>} Plato actualizado
   */
  async updateDish(id, dishData) {
    try {
      const response = await api.put(`/dishes/${id}`, dishData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating dish:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar el plato'
      };
    }
  },

  /**
   * Elimina un plato
   * @param {number} id - ID del plato
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteDish(id) {
    try {
      await api.delete(`/dishes/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting dish:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar el plato'
      };
    }
  }
};

export default dishesService;
