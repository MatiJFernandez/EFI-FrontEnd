import api from '../api/api.js';

/**
 * Servicio de gestión de platos
 * Maneja todas las operaciones CRUD con platos del menú
 */
export const dishesService = {
  /**
   * Obtiene todos los platos
   * @returns {Promise<Array>} Lista de platos
   */
  async getAll() {
    try {
      const response = await api.get('/dishes');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get all dishes error:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener los platos';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Obtiene un plato por ID
   * @param {number} id - ID del plato
   * @returns {Promise<Object>} Datos del plato
   */
  async getById(id) {
    try {
      const response = await api.get(`/dishes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get dish by id error:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener el plato';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Crea un nuevo plato (solo admin)
   * @param {Object} dishData - Datos del plato a crear
   * @returns {Promise<Object>} Plato creado
   */
  async create(dishData) {
    try {
      const response = await api.post('/dishes', dishData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Create dish error:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear el plato';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Actualiza un plato existente (solo admin)
   * @param {number} id - ID del plato a actualizar
   * @param {Object} dishData - Nuevos datos del plato
   * @returns {Promise<Object>} Plato actualizado
   */
  async update(id, dishData) {
    try {
      const response = await api.put(`/dishes/${id}`, dishData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Update dish error:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar el plato';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Elimina un plato (solo admin)
   * @param {number} id - ID del plato a eliminar
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async delete(id) {
    try {
      const response = await api.delete(`/dishes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Delete dish error:', error);
      const errorMessage = error.response?.data?.message || 'Error al eliminar el plato';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Toggle de disponibilidad de un plato (solo admin)
   * @param {number} id - ID del plato
   * @returns {Promise<Object>} Plato actualizado
   */
  async toggleAvailability(id) {
    try {
      const response = await api.patch(`/dishes/${id}/toggle-availability`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Toggle availability error:', error);
      const errorMessage = error.response?.data?.message || 'Error al cambiar disponibilidad';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Obtiene platos por categoría
   * @param {string} category - Categoría del plato
   * @returns {Promise<Array>} Lista de platos filtrados
   */
  async getByCategory(category) {
    try {
      const response = await api.get(`/dishes/category/${category}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Get dishes by category error:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener platos por categoría';
      return { success: false, error: errorMessage };
    }
  }
};

export default dishesService;

