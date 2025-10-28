<<<<<<< HEAD
import { createContext, useState, useContext, useEffect } from 'react';
import dishesService from '../services/menu/dishesService';
=======
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api/api';
>>>>>>> e78647c6629f6fd001047f3010830108c9c7e270

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

<<<<<<< HEAD
  // Cargar platos al montar el contexto
  useEffect(() => {
    loadDishes();
  }, []);

  /**
   * Cargar todos los platos
   */
  const loadDishes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.getAll();
      if (result.success) {
        setDishes(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading dishes:', err);
      setError('Error al cargar los platos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener un plato por ID
   */
  const getDishById = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.getById(id);
      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      console.error('Error getting dish by id:', err);
      setError('Error al obtener el plato');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo plato
   */
  const createDish = async (dishData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.create(dishData);
      if (result.success) {
        setDishes([...dishes, result.data]);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating dish:', err);
      const errorMsg = 'Error al crear el plato';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un plato existente
   */
  const updateDish = async (id, dishData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.update(id, dishData);
      if (result.success) {
        setDishes(dishes.map(dish => 
          dish.id === id ? result.data : dish
        ));
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating dish:', err);
      const errorMsg = 'Error al actualizar el plato';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un plato
   */
  const deleteDish = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.delete(id);
      if (result.success) {
        setDishes(dishes.filter(dish => dish.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting dish:', err);
      const errorMsg = 'Error al eliminar el plato';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle de disponibilidad de un plato
   */
  const toggleAvailability = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await dishesService.toggleAvailability(id);
      if (result.success) {
        setDishes(dishes.map(dish => 
          dish.id === id ? result.data : dish
        ));
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      const errorMsg = 'Error al cambiar la disponibilidad';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener platos por categoría
   */
  const getDishesByCategory = (category) => {
    if (!category) return dishes;
    return dishes.filter(dish => dish.category === category);
  };

  /**
   * Obtener solo platos disponibles
   */
  const getAvailableDishes = () => {
    return dishes.filter(dish => dish.isAvailable);
  };
=======
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
>>>>>>> e78647c6629f6fd001047f3010830108c9c7e270

  const value = {
    dishes,
    loading,
    error,
<<<<<<< HEAD
    loadDishes,
    getDishById,
    createDish,
    updateDish,
    deleteDish,
    toggleAvailability,
    getDishesByCategory,
    getAvailableDishes
=======
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
    getDishById,
    getAvailableDishes,
    getDishesByCategory,
    clearError
>>>>>>> e78647c6629f6fd001047f3010830108c9c7e270
  };

  return (
    <DishesContext.Provider value={value}>
      {children}
    </DishesContext.Provider>
  );
};
<<<<<<< HEAD

=======
>>>>>>> e78647c6629f6fd001047f3010830108c9c7e270
