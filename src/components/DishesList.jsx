import React, { useState } from 'react';
import { useDishes } from '../context/DishesContext';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const DishesList = () => {
  const {
    dishes,
    loading,
    error,
    fetchDishes,
    clearError,
    toggleAvailability
  } = useDishes();
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Filtrar platos
  const filteredDishes = dishes.filter(dish => {
    if (selectedCategory && dish.category !== selectedCategory) return false;
    if (showOnlyAvailable && !dish.available) return false;
    return true;
  });

  // Obtener categorías únicas
  const categories = [...new Set(dishes.map(dish => dish.category))];

  const handleRefresh = () => {
    clearError();
    fetchDishes();
  };

  const handleToggleAvailability = async (id) => {
    await toggleAvailability(id);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Menú de Platos
      </Typography>

      {/* Filtros y acciones */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            label="Categoría"
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant={showOnlyAvailable ? "contained" : "outlined"}
          onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
        >
          {showOnlyAvailable ? "Mostrar Todos" : "Solo Disponibles"}
        </Button>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar'}
        </Button>
      </Box>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Información de resultados */}
      {!loading && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredDishes.length} de {dishes.length} platos
          </Typography>
        </Box>
      )}

      {/* Lista vacía */}
      {filteredDishes.length === 0 && !loading && !error && (
        <Alert severity="info">
          No hay platos disponibles con los filtros seleccionados.
        </Alert>
      )}

      {/* Grid de platos */}
      <Grid container spacing={2}>
        {filteredDishes.map((dish) => (
          <Grid xs={12} sm={6} md={4} lg={3} key={dish.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: dish.available ? 1 : 0.6
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                    {dish.name}
                  </Typography>
                  <Chip
                    label={dish.available ? 'Disponible' : 'No disponible'}
                    color={dish.available ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                
                {dish.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' }}>
                    {dish.description}
                  </Typography>
                )}

                {dish.category && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                    {dish.category}
                  </Typography>
                )}

                <Typography variant="h6" color="primary" sx={{ mt: 'auto' }}>
                  ${dish.price?.toFixed(2) || '0.00'}
                </Typography>
              </CardContent>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, pt: 0 }}>
                {isAdmin && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dish.available}
                        onChange={() => handleToggleAvailability(dish.id)}
                        size="small"
                      />
                    }
                    label="Disponible"
                  />
                )}
                <Box sx={{ display: 'flex', gap: 0 }}>
                  <Tooltip title="Ver detalles">
                    <IconButton size="small" color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {isAdmin && (
                    <>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary">
                          <EditIcon data-testid="EditIcon" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error">
                          <DeleteIcon data-testid="DeleteIcon" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DishesList;
