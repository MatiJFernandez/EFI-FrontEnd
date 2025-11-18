import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dishesService from '../services/dishes/dishesService';

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
  const fetchDishes = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dishesService.getAllDishes(params);
      if (result.success) {
        setDishes(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError('Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new dish
  const createDish = useCallback(async (dishData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dishesService.createDish(dishData);
      if (result.success) {
        setDishes(prev => [...prev, result.data]);
        return { success: true, dish: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating dish:', err);
      const errorMessage = 'Error al crear el plato';
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
      const result = await dishesService.updateDish(id, dishData);
      if (result.success) {
        setDishes(prev => prev.map(dish =>
          dish.id === id ? result.data : dish
        ));
        return { success: true, dish: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating dish:', err);
      const errorMessage = 'Error al actualizar el plato';
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
      const result = await dishesService.deleteDish(id);
      if (result.success) {
        setDishes(prev => prev.filter(dish => dish.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting dish:', err);
      const errorMessage = 'Error al eliminar el plato';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle availability of a dish
  const toggleAvailability = useCallback(async (id) => {
    const dish = dishes.find(d => d.id === id);
    if (!dish) {
      const errorMessage = 'Plato no encontrado';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Toggle the availability
    const updatedData = { ...dish, available: !dish.available };
    return await updateDish(id, updatedData);
  }, [dishes, updateDish]);

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
    toggleAvailability,
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
