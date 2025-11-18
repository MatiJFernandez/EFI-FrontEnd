import api from '../api/api.js';

/**
 * Servicio de detalles de pedidos
 * Maneja las operaciones relacionadas con los detalles de pedidos
 */
export const orderDetailsService = {
  /**
   * Obtiene los detalles de un pedido específico
   * @param {number} orderId - ID del pedido
   * @returns {Promise<Object>} Detalles del pedido
   */
  async getOrderDetails(orderId) {
    try {
      const response = await api.get(`/order_details/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener los detalles del pedido'
      };
    }
  }
};

export default orderDetailsService;
