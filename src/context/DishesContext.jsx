import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api/api';

const DishesContext = createContext();

export const useDishes = () => {
  const context = useContext(DishesContext);
  if (!context) {
    throw new Error('useDishes must be used within a DishesProvider');
  }
  return context;
};

export const DishesProvider = ({ children }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all dishes
  const fetchDishes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/dishes');
      setDishes(response.data);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err.response?.data?.message || 'Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new dish
  const createDish = useCallback(async (dishData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/dishes', dishData);
      setDishes(prev => [...prev, response.data]);
      return { success: true, dish: response.data };
    } catch (err) {
      console.error('Error creating dish:', err);
      const errorMessage = err.response?.data?.message || 'Error al crear el plato';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a dish
  const updateDish = useCallback(async (id, dishData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/dishes/${id}`, dishData);
      setDishes(prev => prev.map(dish =>
        dish.id === id ? response.data : dish
      ));
      return { success: true, dish: response.data };
    } catch (err) {
      console.error('Error updating dish:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar el plato';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a dish
  const deleteDish = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dishes/${id}`);
      setDishes(prev => prev.filter(dish => dish.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting dish:', err);
      const errorMessage = err.response?.data?.message || 'Error al eliminar el plato';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get dish by ID
  const getDishById = useCallback((id) => {
    return dishes.find(dish => dish.id === id);
  }, [dishes]);

  // Get available dishes (not discontinued)
  const getAvailableDishes = useCallback(() => {
    return dishes.filter(dish => dish.available !== false);
  }, [dishes]);

  // Get dishes by category (if implemented in backend)
  const getDishesByCategory = useCallback((category) => {
    return dishes.filter(dish => dish.category === category);
  }, [dishes]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load dishes on mount
  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const value = {
    dishes,
    loading,
    error,
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
    getDishById,
    getAvailableDishes,
    getDishesByCategory,
    clearError
  };

  return (
    <DishesContext.Provider value={value}>
      {children}
    </DishesContext.Provider>
  );
};
