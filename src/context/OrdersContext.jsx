import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ordersService from '../services/orders/ordersService';
import { useAuth } from './AuthContext';

const OrdersContext = createContext();

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

export const OrdersProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.getAllOrders();
      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new order
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.createOrder(orderData);
      if (result.success) {
        setOrders(prev => [...prev, result.data]);
        return { success: true, order: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating order:', err);
      const errorMessage = 'Error al crear el pedido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an order
  const updateOrder = useCallback(async (id, orderData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.updateOrder(id, orderData);
      if (result.success) {
        setOrders(prev => prev.map(order =>
          order.id === id ? result.data : order
        ));
        return { success: true, order: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating order:', err);
      const errorMessage = 'Error al actualizar el pedido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (id, status) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.updateOrderStatus(id, status);
      if (result.success) {
        setOrders(prev => prev.map(order =>
          order.id === id ? result.data : order
        ));
        return { success: true, order: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage = 'Error al actualizar el estado del pedido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete an order
  const deleteOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ordersService.deleteOrder(id);
      if (result.success) {
        setOrders(prev => prev.filter(order => order.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      const errorMessage = 'Error al eliminar el pedido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get order by ID
  const getOrderById = useCallback((id) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Get orders filtered by user role
  const getOrdersByRole = useCallback(() => {
    if (!user || !user.role) return orders;

    switch (user.role) {
      case 'admin':
        // Admin can see all orders
        return orders;
      case 'moderator':
        // Moderator (cook) can see orders that are preparing, ready, or delivered
        return orders.filter(order =>
          ['preparing', 'ready', 'delivered'].includes(order.status)
        );
      case 'user':
        // User (waiter) can see orders for their assigned tables or all orders if no table assignment
        // For now, return all orders - this could be enhanced with table assignment logic
        return orders;
      default:
        return orders;
    }
  }, [orders, user]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Set up polling to refresh orders every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderById,
    getOrdersByStatus,
    getOrdersByRole,
    clearError
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};
