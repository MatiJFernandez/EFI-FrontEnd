import React from 'react';
import { useDishes } from '../context/DishesContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

const DishesTest = () => {
  const {
    dishes,
    loading,
    error,
    fetchDishes,
    clearError
  } = useDishes();

  const handleRefresh = () => {
    clearError();
    fetchDishes();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Dishes Context Test
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Recargar Platos'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        Platos Disponibles: {dishes.length}
      </Typography>

      {dishes.length === 0 && !loading && !error && (
        <Alert severity="info">
          No hay platos disponibles. El backend de dishes aún no está implementado.
        </Alert>
      )}

      <Grid container spacing={2}>
        {dishes.map((dish) => (
          <Grid item xs={12} sm={6} md={4} key={dish.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {dish.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {dish.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" color="primary">
                    ${dish.price}
                  </Typography>
                  <Chip
                    label={dish.available ? 'Disponible' : 'No disponible'}
                    color={dish.available ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DishesTest;
