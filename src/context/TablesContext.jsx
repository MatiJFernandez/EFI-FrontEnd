import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api/api';
import { useAuth } from './AuthContext';

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
      const resp = response.data || {};
      const list = Array.isArray(resp.data) ? resp.data : (Array.isArray(resp) ? resp : []);
      setTables(list);
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
  const resp = response.data || {};
  const created = resp.data ?? resp;
  setTables(prev => [...prev, created]);
  return { success: true, table: created };
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
  const resp = response.data || {};
  const updated = resp.data ?? resp;
  setTables(prev => prev.map(t => (t.id === id ? updated : t)));
  return { success: true, table: updated };
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
  const resp = response.data || {};
  const updated = resp.data ?? resp;
  setTables(prev => prev.map(t => (t.id === id ? updated : t)));
  return { success: true, table: updated };
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

  // Load tables on mount (only if authenticated)
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTables();
    }
  }, [isAuthenticated, fetchTables]);

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
