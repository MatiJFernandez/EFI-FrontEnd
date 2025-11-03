import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useTables } from '../context/TablesContext';
import TableForm from './TableForm';

const AdminTables = () => {
  const { tables, loading, error, fetchTables, createTable, updateTable, deleteTable } = useTables();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreate = async (data) => {
    setActionLoading(true);
    setLocalError(null);
    const result = await createTable(data);
    if (result.success) {
      setShowForm(false);
    } else {
      setLocalError(result.error);
    }
    setActionLoading(false);
  };

  const handleUpdate = async (data) => {
    if (!editing) return;
    setActionLoading(true);
    setLocalError(null);
    const result = await updateTable(editing.id, data);
    if (result.success) {
      setEditing(null);
      setShowForm(false);
    } else {
      setLocalError(result.error);
    }
    setActionLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar mesa?')) return;
    setActionLoading(true);
    setLocalError(null);
    const result = await deleteTable(id);
    if (!result.success) setLocalError(result.error);
    setActionLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Administración de Mesas</Typography>

      {error && <Alert severity="error">{error}</Alert>}
      {localError && <Alert severity="error">{localError}</Alert>}

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setShowForm(true); }}>
          Nueva Mesa
        </Button>
      </Box>

      {showForm && (
        <TableForm
          initialData={editing || undefined}
          onSubmit={editing ? handleUpdate : handleCreate}
          loading={actionLoading}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Capacidad</TableCell>
                <TableCell>Ubicación</TableCell>
                <TableCell>Disponible</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tables.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.number}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.capacity}</TableCell>
                  <TableCell>{t.location}</TableCell>
                  <TableCell>{t.available ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setEditing(t); setShowForm(true); }}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(t.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminTables;
