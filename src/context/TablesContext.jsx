import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api/api';

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

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError(err.response?.data?.message || 'Error al cargar las mesas');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTable = useCallback(async (tableData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/tables', tableData);
      setTables(prev => [...prev, response.data]);
      return { success: true, table: response.data };
    } catch (err) {
      console.error('Error creating table:', err);
      const errorMessage = err.response?.data?.message || 'Error al crear la mesa';
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
      const response = await api.put(`/tables/${id}`, tableData);
      setTables(prev => prev.map(t => (t.id === id ? response.data : t)));
      return { success: true, table: response.data };
    } catch (err) {
      console.error('Error updating table:', err);
      const errorMessage = err.response?.data?.message || 'Error al actualizar la mesa';
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
      await api.delete(`/tables/${id}`);
      setTables(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      console.error('Error deleting table:', err);
      const errorMessage = err.response?.data?.message || 'Error al eliminar la mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const setTableStatus = useCallback(async (id, status) => {
    // status could be { occupied: true/false } or similar
    setLoading(true);
    setError(null);
    try {
      const response = await api.patch(`/tables/${id}`, status);
      setTables(prev => prev.map(t => (t.id === id ? response.data : t)));
      return { success: true, table: response.data };
    } catch (err) {
      console.error('Error updating table status:', err);
      const errorMessage = err.response?.data?.message || 'Error al cambiar el estado de la mesa';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTableById = useCallback((id) => {
    return tables.find(t => t.id === id);
  }, [tables]);

  const getAvailableTables = useCallback(() => {
    // assuming table.available === true means available
    return tables.filter(t => t.available !== false && !t.occupied);
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
