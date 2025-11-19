import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, MenuItem } from '@mui/material';
import { validateField, validateForm } from '../utils/validations';

const initialState = {
  name: '',
  description: '',
  price: '',
  category: ''
};

const categories = [
  'Entrada',
  'Plato Principal',
  'Postre',
  'Bebida'
];

const DishForm = ({ initialData = initialState, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value, formData);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length === 0 && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>
        {initialData && initialData.id ? 'Editar Plato' : 'Agregar Plato'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          label="Descripción"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          error={!!formErrors.description}
          helperText={formErrors.description}
        />
        <TextField
          label="Precio"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          required
          error={!!formErrors.price}
          helperText={formErrors.price}
        />
        <TextField
          select
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          error={!!formErrors.category}
          helperText={formErrors.category}
        >
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? 'Guardando...' : (initialData && initialData.id ? 'Actualizar' : 'Agregar')}
        </Button>
      </Box>
    </Paper>
  );
}
;

export default DishForm;
