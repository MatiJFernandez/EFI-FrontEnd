import { createContext, useState, useContext, useEffect } from 'react';
import dishesService from '../services/menu/dishesService';

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

  const value = {
    dishes,
    loading,
    error,
    loadDishes,
    getDishById,
    createDish,
    updateDish,
    deleteDish,
    toggleAvailability,
    getDishesByCategory,
    getAvailableDishes
  };

  return (
    <DishesContext.Provider value={value}>
      {children}
    </DishesContext.Provider>
  );
};

