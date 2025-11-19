import api from '../api/api.js';

/**
 * Servicio de mesas
 * Maneja las operaciones relacionadas con mesas
 */
export const tablesService = {
  /**
   * Obtiene todas las mesas
   * @param {Object} params - Parámetros de consulta opcionales
   * @param {number} params.number - Número de mesa
   * @param {boolean} params.disponible - Filtrar por disponibilidad
   * @param {number} params.minCapacity - Capacidad mínima
   * @param {number} params.maxCapacity - Capacidad máxima
   * @returns {Promise<Object>} Lista de mesas
   */
  async getAllTables(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.number) queryParams.append('number', params.number);
      if (params.disponible !== undefined) queryParams.append('disponible', params.disponible);
      if (params.minCapacity) queryParams.append('minCapacity', params.minCapacity);
      if (params.maxCapacity) queryParams.append('maxCapacity', params.maxCapacity);

      const url = `/tables${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      // Mapear status -> disponible/available en los items si vienen en data.data
      const payload = { ...response.data };
      if (payload && Array.isArray(payload.data)) {
        payload.data = payload.data.map((t) => ({
          ...t,
          // disponible/available derivados del status del backend
          disponible: t.status ? t.status === 'available' : t.disponible,
          available: t.status ? t.status === 'available' : t.available
        }));
      }
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error fetching tables:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener las mesas'
      };
    }
  },

  /**
   * Obtiene una mesa por ID
   * @param {number} id - ID de la mesa
   * @returns {Promise<Object>} Datos de la mesa
   */
  async getTableById(id) {
    try {
      const response = await api.get(`/tables/${id}`);
      const payload = { ...response.data };
      if (payload && payload.data) {
        payload.data = {
          ...payload.data,
          disponible: payload.data.status ? payload.data.status === 'available' : payload.data.disponible,
          available: payload.data.status ? payload.data.status === 'available' : payload.data.available
        };
      }
      return { success: true, data: payload };
    } catch (error) {
      console.error('Error fetching table:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener la mesa'
      };
    }
  },

  /**
   * Crea una nueva mesa
   * @param {Object} tableData - Datos de la mesa
   * @returns {Promise<Object>} Mesa creada
   */
  async createTable(tableData) {
    try {
      // Mapear disponible/available -> status
      const payload = { ...tableData };
      if (payload.disponible !== undefined) {
        payload.status = payload.disponible ? 'available' : 'occupied';
      } else if (payload.available !== undefined) {
        payload.status = payload.available ? 'available' : 'occupied';
      }
      const { disponible, available, ...clean } = payload;
      const response = await api.post('/tables', clean);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating table:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear la mesa'
      };
    }
  },

  /**
   * Actualiza una mesa
   * @param {number} id - ID de la mesa
   * @param {Object} tableData - Datos actualizados de la mesa
   * @returns {Promise<Object>} Mesa actualizada
   */
  async updateTable(id, tableData) {
    try {
      // Mapear disponible/available -> status
      const payload = { ...tableData };
      if (payload.disponible !== undefined) {
        payload.status = payload.disponible ? 'available' : 'occupied';
      } else if (payload.available !== undefined) {
        payload.status = payload.available ? 'available' : 'occupied';
      }
      const { disponible, available, ...clean } = payload;
      const response = await api.put(`/tables/${id}`, clean);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating table:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar la mesa'
      };
    }
  },

  /**
   * Elimina una mesa
   * @param {number} id - ID de la mesa
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteTable(id) {
    try {
      await api.delete(`/tables/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting table:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar la mesa'
      };
    }
  }
};

export default tablesService;
