import React, { useState, useEffect, useMemo } from 'react';
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
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
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
    toggleAvailability,
    updateDish,
    deleteDish
  } = useDishes();
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ name: '', description: '', category: '', price: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  // Asegurar datos y fetch inicial
  const safeDishes = useMemo(() => Array.isArray(dishes) ? dishes : [], [dishes]);
  useEffect(() => {
    if (!safeDishes.length && !loading) {
      fetchDishes();
    }
  }, [safeDishes.length, loading, fetchDishes]);

  // Filtrar platos
  const filteredDishes = safeDishes.filter(dish => {
    // Usuarios no admin solo ven disponibles
    if (!isAdmin && !dish.available) return false;
    if (selectedCategory && dish.category !== selectedCategory) return false;
    if (showOnlyAvailable && !dish.available) return false;
    return true;
  });

  // Obtener categorías únicas (respetando visibilidad del rol)
  const categories = useMemo(() => {
    return [
      ...new Set(
        safeDishes
          .filter(d => (isAdmin ? true : d.available))
          .map(dish => dish.category)
          .filter(Boolean)
      )
    ];
  }, [safeDishes, isAdmin]);

  const handleRefresh = () => {
    clearError();
    fetchDishes();
  };

  const handleToggleAvailability = async (id) => {
    await toggleAvailability(id);
  };

  // Admin: editar/eliminar
  const startEdit = (dish) => {
    setEditing(dish);
    setEditValues({
      name: dish.name || '',
      description: dish.description || '',
      category: dish.category || '',
      price: String(dish.price ?? '')
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    const payload = {
      name: editValues.name,
      description: editValues.description,
      category: editValues.category,
      price: Number(editValues.price)
    };
    await updateDish(editing.id, payload);
    setEditing(null);
  };

  const handleDeleteClick = (id) => {
    setToDeleteId(id);
    setConfirmOpen(true);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setToDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    if (toDeleteId) {
      await deleteDish(toDeleteId);
      setConfirmOpen(false);
      setToDeleteId(null);
    }
  };

  // Formatear precio evitando errores si viene string/null
  const fmtPrice = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : Number(v ?? 0);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };

  return (
    <Box sx={{ p: 3 }}>

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
            Mostrando {filteredDishes.length} de {safeDishes.length} platos
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
      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: 'auto' }}>
        {filteredDishes.map((dish) => (
          <Grid item xs={12} sm={6} md={4} lg={4} xl={4} key={dish.id}>
            <Card 
              sx={{ 
                height: '100%', 
                minHeight: 180,
                display: 'flex', 
                flexDirection: 'column',
                opacity: dish.available ? 1 : 0.6,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'transform .15s ease, box-shadow .2s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 28px rgba(255,122,29,0.12)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 3 }}>
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

                <Typography variant="h6" color="primary" sx={{ mt: 'auto', fontWeight: 800 }}>
                  ${fmtPrice(dish.price)}
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
                  {isAdmin && (
                    <>
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => startEdit(dish)}>
                          <EditIcon data-testid="EditIcon" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(dish.id)}>
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

      {/* Diálogo editar plato */}
      <Dialog open={!!editing} onClose={cancelEdit} fullWidth maxWidth="sm">
        <DialogTitle>Editar plato</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              value={editValues.name}
              onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
            />
            <TextField
              label="Descripción"
              value={editValues.description}
              onChange={(e) => setEditValues(v => ({ ...v, description: e.target.value }))}
            />
            <TextField
              label="Categoría"
              value={editValues.category}
              onChange={(e) => setEditValues(v => ({ ...v, category: e.target.value }))}
            />
            <TextField
              label="Precio"
              type="number"
              value={editValues.price}
              onChange={(e) => setEditValues(v => ({ ...v, price: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminar */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Eliminar plato</DialogTitle>
        <DialogContent>
          ¿Estás seguro de eliminar este plato? Esta acción no se puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DishesList;
