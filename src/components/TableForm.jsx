import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Switch, FormControlLabel } from '@mui/material';
import { validateField } from '../utils/validations';

const initialState = {
  number: '',
  name: '',
  capacity: '',
  location: '',
  available: true,
};

const TableForm = ({ initialData = initialState, onSubmit, loading = false, onCancel }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setFormErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    const error = validateField(name, val, formData);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation for required fields
    const errors = {};
    if (!formData.number) errors.number = 'Número es requerido';
    if (!formData.capacity) errors.capacity = 'Capacidad es requerida';
    if (!formData.name) errors.name = 'Nombre es requerido';

    setFormErrors(errors);
    if (Object.keys(errors).length === 0 && onSubmit) {
      // Normalize data types
      const payload = { ...formData, capacity: Number(formData.capacity) };
      onSubmit(payload);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialData && initialData.id ? 'Editar Mesa' : 'Nueva Mesa'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Número"
          name="number"
          value={formData.number}
          onChange={handleChange}
          required
          error={!!formErrors.number}
          helperText={formErrors.number}
        />
        <TextField
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          error={!!formErrors.name}
          helperText={formErrors.name}
        />
        <TextField
          label="Capacidad"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
          required
          error={!!formErrors.capacity}
          helperText={formErrors.capacity}
        />
        <TextField
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        <FormControlLabel
          control={<Switch checked={!!formData.available} onChange={handleChange} name="available" />}
          label="Disponible"
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Guardando...' : (initialData && initialData.id ? 'Actualizar' : 'Crear')}
          </Button>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>Cancelar</Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default TableForm;
