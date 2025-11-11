import api from '../api/api';

const ordersService = {
  // Obtener todos los pedidos
  getAllOrders: async () => {
    try {
  const response = await api.get('/orders');
  // Unwrap actual data if backend returns { success, count, data }
  const respData = response.data || {};
  const data = Array.isArray(respData.data) ? respData.data : (Array.isArray(respData) ? respData : respData.data || respData);
  return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener los pedidos'
      };
    }
  },

  // Obtener un pedido por ID
  getOrderById: async (id) => {
    try {
  const response = await api.get(`/orders/${id}`);
  const respData = response.data || {};
  const data = respData.data ?? respData;
  return { success: true, data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener el pedido'
      };
    }
  },

  // Crear un nuevo pedido
  createOrder: async (orderData) => {
    try {
  const response = await api.post('/orders', orderData);
  const respData = response.data || {};
  const data = respData.data ?? respData;
  return { success: true, data };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al crear el pedido'
      };
    }
  },

  // Actualizar un pedido
  updateOrder: async (id, orderData) => {
    try {
  const response = await api.put(`/orders/${id}`, orderData);
  const respData = response.data || {};
  const data = respData.data ?? respData;
  return { success: true, data };
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar el pedido'
      };
    }
  },

  // Actualizar el estado de un pedido
  updateOrderStatus: async (id, status) => {
    try {
  const response = await api.patch(`/orders/${id}/status`, { status });
  const respData = response.data || {};
  const data = respData.data ?? respData;
  return { success: true, data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al actualizar el estado del pedido'
      };
    }
  },

  // Eliminar un pedido
  deleteOrder: async (id) => {
    try {
  await api.delete(`/orders/${id}`);
  return { success: true };
    } catch (error) {
      console.error('Error deleting order:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al eliminar el pedido'
      };
    }
  },

  // Obtener pedidos por estado
  getOrdersByStatus: async (status) => {
    try {
  const response = await api.get(`/orders?status=${status}`);
  const respData = response.data || {};
  const data = Array.isArray(respData.data) ? respData.data : (Array.isArray(respData) ? respData : respData.data || respData);
  return { success: true, data };
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener los pedidos'
      };
    }
  }
};

export default ordersService;

