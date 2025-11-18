import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import tablesService from '../services/tables/tablesService';

const TablesContext = createContext();

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error('useTables must be used within a TablesProvider');
  }
  return context;
};

export const TablesProvider = ({ children }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tablesService.getAllTables(params);
      if (result.success) {
        setTables(result.data.data || []); // Extract the data array from the response
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTable = useCallback(async (tableData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tablesService.createTable(tableData);
      if (result.success) {
        setTables(prev => [...prev, result.data]);
        return { success: true, table: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error creating table:', err);
      const errorMessage = 'Error al crear la mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTable = useCallback(async (id, tableData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tablesService.updateTable(id, tableData);
      if (result.success) {
        setTables(prev => prev.map(t => (t.id === id ? result.data : t)));
        return { success: true, table: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating table:', err);
      const errorMessage = 'Error al actualizar la mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTable = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await tablesService.deleteTable(id);
      if (result.success) {
        setTables(prev => prev.filter(t => t.id !== id));
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting table:', err);
      const errorMessage = 'Error al eliminar la mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const setTableStatus = useCallback(async (id, status) => {
    // status could be { occupied: true/false } or similar
    const table = Array.isArray(tables) ? tables.find(t => t.id === id) : null;
    if (!table) {
      const errorMessage = 'Mesa no encontrada';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Merge current table data with new status
    const updatedData = { ...table, ...status };
    return await updateTable(id, updatedData);
  }, [tables, updateTable]);

  const getTableById = useCallback((id) => {
    return Array.isArray(tables) ? tables.find(t => t.id === id) : null;
  }, [tables]);

  const getAvailableTables = useCallback(() => {
    // assuming table.available === true means available
    return Array.isArray(tables) ? tables.filter(t => t.available !== false && !t.occupied) : [];
  }, [tables]);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const value = {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    updateTable,
    deleteTable,
    setTableStatus,
    getTableById,
    getAvailableTables,
    clearError
  };

  return (
    <TablesContext.Provider value={value}>{children}</TablesContext.Provider>
  );
};
